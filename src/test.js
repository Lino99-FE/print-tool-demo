// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import printTool from './index'
import './style.css'
import OptionsComp from './OptionsComp.jsx'
import useUpdateEffect from './hooks/useUpdateEffect.js';

const devFlag = process.env.NODE_ENV === 'development';
const baseUrl = devFlag ? '' : '/print';
console.log('%c [ process.env.NODE_ENV ]-9', 'font-size:13px; background:pink; color:#bf2c9f;', process.env.NODE_ENV, devFlag, baseUrl)

function calculateSpaceUsage(str) {
  // 使用 TextEncoder 对象获取字符串的字节长度
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);

  // 返回字节长度
  return bytes.length;
}

function compressString(str) {
  return str.replace(/\s+/g, ' ').trim();
}
const pageSize = printTool.getPageSize('A4')
const mockData = await (await fetch(`${baseUrl}/mockData.json`)).json()
mockData.pageSize = pageSize

const TestComp = () => {

  const [printData, setPrintData] = useState(JSON.parse(JSON.stringify(mockData)));
  const [autoFresh, setAutoFresh] = useState(true);
  const [freshType, setFreshType] = useState(1);
  const [purePrintFlag, setPurePrintFlag] = useState(false);

  const makePageTemplate = async () => {
    const res = await fetch(`${baseUrl}/mockTemp.hbs`)
    const htmlText = compressString(await res.text())
    // console.log('%c [ mockData ]-30', 'font-size:13px; background:pink; color:#bf2c9f;', mockData)
    // console.log('%c [ htmlText ]-21', 'font-size:13px; background:pink; color:#bf2c9f;', Object.prototype.toString.call(htmlText), `string size:${calculateSpaceUsage(htmlText)} bytes`)
    const divDom = document.querySelector('#testDiv')
    console.log('%c [ 传入数据 ]-53', 'font-size:13px; background:pink; color:#bf2c9f;', printData)
    let containerClass = 'print-preview-container'
    if (purePrintFlag) {
      containerClass = ''
    }
    console.time('渲染耗时')
    // const tmp = printTool.renderTemplate('<div><div><div>{{a}}</div></div></div>', {a: '123'}, 'A4')
    const tmp = printTool.renderTemplate(htmlText, printData, 'A4', null, containerClass)
    divDom.innerHTML = tmp
    console.timeEnd('渲染耗时')
  }

  const makeBaseTemplate = async () => {
    const res = await fetch(`${baseUrl}/mockTemp.hbs`)
    const htmlText = compressString(await res.text())
    const divDom = document.querySelector('#testDiv')
    const tmp = printTool.renderTemplateForTest(htmlText, printData, 'A4')
    divDom.innerHTML = tmp
  }

  useEffect(() => {
    const { hash } = window.location
    if (hash === '#single') {
      setPurePrintFlag(true)
      makePageTemplate()
    }
  }, [])

  useUpdateEffect(() => {
    if (autoFresh) {
      if (freshType === 1) {
        makePageTemplate()
      } else {
        makeBaseTemplate()
      }
    }
    if (purePrintFlag) {
      makePageTemplate()
    }
  }, [printData]);

  const printFn = () => {
    const LODOP = printTool.getLodop()
    const divDom = document.querySelector('#testDiv')
    LODOP.PRINT_INIT("打印任务名");             //首先一个初始化语句
    LODOP.SET_PRINT_PAGESIZE(0,0,0,'A6');
    console.log('%c [ pageSize.mm.width * 10, pageSize.mm.height * 10 ]-87', 'font-size:13px; background:pink; color:#bf2c9f;', pageSize.mm.width * 10, pageSize.mm.height * 10)
    LODOP.ADD_PRINT_HTM(0, 0, '100%', '100%', divDom.innerHTML);//然后多个ADD语句及SET语句
    // LODOP.ADD_PRINT_HTM(0, 0, pageSize.mm.width * 10, pageSize.mm.height * 10, divDom.innerHTML);//然后多个ADD语句及SET语句
    LODOP.PREVIEW();                               //最后一个打印(或预览、维护、设计)语句
  }

  const changeData = (newData) => {
    console.log('%c [ newData ]-63', 'font-size:13px; background:pink; color:#bf2c9f;', newData)
    setPrintData(newData)
  }

  const clickTest = () => {
    fetch('http://localhost:6099/test').then(res => console.log(res))
  }

  return <>
    {!purePrintFlag && <>
      <div style={{ backgroundColor: "burlywood", padding: 6, display: 'flex', gap: '15px' }} >
        <button id="printBtn" onClick={clickTest}>接口测试</button>
        <button id="printBtn" onClick={makePageTemplate}>分页效果</button>
        <button id="printBtn" onClick={makeBaseTemplate}>直出效果</button>
        <button id="printBtn" onClick={printFn} >打印</button>
        <label>自动刷新<input defaultChecked={autoFresh} type='checkbox' onChange={(e) => { setAutoFresh(!autoFresh) }} /></label>
        <div>刷新类型：<label>分页<input name="freshType" type="radio" onChange={(e) => {setFreshType(1)}} checked={freshType===1} /></label>&nbsp;<label>直出<input name="freshType" type="radio" onChange={(e) => {setFreshType(2)}} checked={freshType===2} /></label> </div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ minWidth: "200px", maxWidth: "300px" }} >
          <OptionsComp mockData={mockData} changeData={changeData} baseUrl={baseUrl} />
        </div>
        <div id="testDiv" ></div>
      </div>
    </>}
    {purePrintFlag && <>
      <div id="testDiv" style={{width: 'fit-content'}} ></div>
      <div style={{display: 'none'}}><OptionsComp mockData={mockData} changeData={changeData} /></div>
    </>}
  </>
}

const optionsDom = document.getElementById('root')
const root = createRoot(optionsDom)
root.render(<TestComp />);




