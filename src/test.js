// @ts-nocheck
import React from 'react';
import { createRoot } from 'react-dom/client';
import printTool from './index'
import './style.css'
import OptionsComp from './OptionsComp.jsx'

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
const mockData = await (await fetch('/mockData.json')).json()
mockData.pageSize = pageSize

const TestComp = () => {

  const [printData, setPrintData] = React.useState(JSON.parse(JSON.stringify(mockData)));
  const [autoFresh, setAutoFresh] = React.useState(false);

  const makePageTemplate = async () => {
    const res = await fetch('/mockTemp.hbs')
    const htmlText = compressString(await res.text())
    // console.log('%c [ mockData ]-30', 'font-size:13px; background:pink; color:#bf2c9f;', mockData)
    // console.log('%c [ htmlText ]-21', 'font-size:13px; background:pink; color:#bf2c9f;', Object.prototype.toString.call(htmlText), `string size:${calculateSpaceUsage(htmlText)} bytes`)
    const divDom = document.querySelector('#testDiv')
    const tmp = printTool.renderTemplate(htmlText, printData, 'A4')
    divDom.innerHTML = tmp

  }

  const makeBaseTemplate = async () => {
    const res = await fetch('/mockTemp.hbs')
    const htmlText = compressString(await res.text())
    const divDom = document.querySelector('#testDiv')
    const tmp = printTool.renderTemplateWithoutCalc(htmlText, printData, 'A4')
    divDom.innerHTML = tmp
  }

  React.useEffect(() => {
    if (autoFresh) {
      makePageTemplate()
    }
  }, [printData]);

  const printFn = () => {
    const divDom = document.querySelector('#testDiv')
    LODOP.PRINT_INIT("打印任务名");             //首先一个初始化语句
    LODOP.ADD_PRINT_HTM(0, 0, pageSize.mm.width * 10, pageSize.mm.height * 10, divDom.innerHTML);//然后多个ADD语句及SET语句
    LODOP.PREVIEW();                               //最后一个打印(或预览、维护、设计)语句
  }

  const changeData = (newData) => {
    setPrintData(newData)
  }

  return <>
    <div style={{backgroundColor: "burlywood", padding: 6, display: 'flex', gap: '15px'}} >
      <button id="printBtn" onClick={makePageTemplate}>分页效果</button>
      <button id="printBtn" onClick={makeBaseTemplate}>原始模板</button>
      <button id="printBtn" onClick={printFn} >打印</button>
      <label>自动刷新<input defaultChecked={autoFresh} type='checkbox' onChange={(e) => {setAutoFresh(!autoFresh)}} /></label>
    </div>
    <div style={{display: "flex"}}>
      <div style={{minWidth: "200px",maxWidth: "300px"}} >
        <OptionsComp mockData={mockData} changeData={changeData} />
      </div>
      <div id="testDiv" ></div>
    </div>
  </>
}

const optionsDom = document.getElementById('root')
const root = createRoot(optionsDom)
root.render(<TestComp />);




