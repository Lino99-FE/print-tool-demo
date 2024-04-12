import Handlebars from "handlebars";
import {getLodop} from './LodopFuncs.js'

// 普通纸:常用纸尺寸
const pageType = {
  A4: {
    px: {
      width: 795,
      height: 1123,
      paddingTB: 5, // 上下padding
      paddingLR: 20, // 左右padding
    },
    mm: { // 非必须，仅是为了增加物理参照
      width: 210,
      height: 297
    }
  },
  A5: {
    px: {
      width: 397,
      height: 561,
      paddingTB: 5, // 上下padding
      paddingLR: 20, // 左右padding
    },
    mm: { // 非必须，仅是为了增加物理参照
      width: 105,
      height: 149
    }
  },
}

const _createTemplateContainer = () => {
  const today = new Date()
  const domId = `${today.getFullYear()}${today.getMonth()}${today.getDay()}-newTemplateId`
  let resultDom = document.getElementById(domId)
  if (resultDom) {
    resultDom.innerHTML = ''
  } else {
    resultDom = document.createElement('div')
    resultDom.id = domId
  }
  return resultDom
}

const _createTmpPageDom = (baseRemainingHeight) => {
  const tmpDom = document.createElement('div')
  tmpDom.style.top = `-${baseRemainingHeight}px`
  document.body.appendChild(tmpDom)
  return tmpDom
}

const _fillTemplate = (currentDefaultDomArrIdx,  baseArgs, containerClass = null, pageIndex = 1) => {
  const {domArr, containerDom, defaultDomIdxArr, baseRemainingHeight} = baseArgs
  const resultArr = []

  // 创建临时dom元素用于分页高度计算,完成计算后在方法结尾进行移除
  const tmpDom = _createTmpPageDom(baseRemainingHeight)

  let pageRemainingHeight = baseRemainingHeight
  const container = containerDom.cloneNode(false)
  if (containerClass) {
    container.classList.add(containerClass)
  }
  try {
    for (const [idx, item] of domArr.entries()) {
      // 目前正在填充的非fixed元素,在domArr数组中的索引
      // eg: [fixed， default,fixed，default,default,fixed，fixed，];  defaultDomIdxArr:[1,3,4]
      const defaultDomIdx = defaultDomIdxArr[currentDefaultDomArrIdx]
      const {itemDom, domType} = item
      if (domType === 'fixed') {
        // fixed类型无需额外处理，直接添加至容器里
        container.appendChild(itemDom.cloneNode(true))
      } else if (idx === defaultDomIdx) {
        const itemHeight = itemDom.offsetHeight || 0
        // 判断当前需要填充的元素是否需要进行分页处理
        if (pageRemainingHeight - itemHeight > 0) {
          // 无需分页,直接添加至页面, currentDefaultDomArrIdx指向下一个需要填充的元素
          currentDefaultDomArrIdx +=1
          const itemDomTmp = itemDom.cloneNode(true)
          // 最后一个元素，需要判断是否还有剩余高度，如果有则需要填充避免出现页脚fixed元素跟随浮动上来
          if (currentDefaultDomArrIdx === defaultDomIdxArr.length) {
            itemDomTmp.style.height = `${pageRemainingHeight}px`
          }
          container.appendChild(itemDomTmp)
          pageRemainingHeight -= itemHeight
        } else {
          // 需要分页处理，计算当前页面能够添加多少子元素.
          // 当前页面添加完成后需要继续填充后续的fixed元素，并创建下一页头部fixed元素
          const pageContainerDom = itemDom.cloneNode(false)
          const tmpDomPageDom = itemDom.cloneNode(false)
          tmpDom.appendChild(tmpDomPageDom)
          const len = itemDom.children.length
  
          for (let childIdx = 0; childIdx < len; childIdx++) {
            // 单个子元素高度判断
            if (itemDom.children[0].offsetHeight > baseRemainingHeight) {
              console.error('%c [ itemDom.children[0].offsetHeight > baseRemainingHeight ]', 'font-size:13px; background:pink; color:#bf2c9f;', '模板异常，容器内单个子元素高度超出模板非fixed可用高度,请检查元素结构', `容器class：${itemDom.className};`,`单个子元素高度:${itemDom.children[0].offsetHeight}`, `可用高度:${baseRemainingHeight}`)
              console.dir(itemDom)
              throw new Error('模板异常，容器内单个子元素高度超出模板非fixed可用高度')
            }
            // 从基础模板在获取需要添加的元素并添加到容器内
            const childItem = itemDom.removeChild(itemDom.children[0])
            tmpDomPageDom.appendChild(childItem.cloneNode(true))
  
            // 容器包含第一个子元素高度判断，避免单个元素高度符合要求，但是容器存在边距导致容器整体高度不符合要求
            if (childIdx === 0 && tmpDomPageDom.offsetHeight > baseRemainingHeight) {
              console.error('%c [ tmpDom.offsetHeight > baseRemainingHeight ]', 'font-size:13px; background:pink; color:#bf2c9f;', '模板异常，容器加第一个子元素高度超出模板非fixed可用高度', `容器及子元素内容：${tmpDomPageDom.innerHTML};`, `可用高度:${baseRemainingHeight}`)
              throw new Error('模板异常，容器加第一个子元素高度超出模板非fixed可用高度')
            }
  
            // 一旦容器高度超出剩余可用高度，则停止添加,进行新一页的组装
            if (tmpDomPageDom.offsetHeight > pageRemainingHeight) {
              // 将上一次超高元素还原回domArr内，避免新开页数据丢失
              itemDom.insertBefore(childItem, itemDom.children[0])
              // 开启新的一页，继续写入剩余内容
              resultArr.unshift(..._fillTemplate(currentDefaultDomArrIdx, baseArgs, containerClass, pageIndex+1))
              pageContainerDom.style.height = `${pageRemainingHeight}px`
              break;
            }
            pageContainerDom.appendChild(childItem.cloneNode(true))
          }
          container.appendChild(pageContainerDom)
        }
      }
    }
  } catch(e) {

  } finally {
    document.body.removeChild(tmpDom)
  }
 
  resultArr.unshift(container)
  return resultArr
}

const printTool = {
  /** 根据传入的模板字符串匹配data数据，生成html模板内容
   * @param {string} template 模板字符串
   * @param {object} data 内容数据
   * @param {string} pageType 打印纸张类型
   * @param {object} pageSize 自定义纸张的尺寸,宽、高、边距，eg: {width: xxx, height: xxx, padding： xx}
   * @param {string} containerClass 生成打印内容的每页容器的自定义class，可以用于业务系统自定义样式需求
   * @returns {string} 原生html内容,直接append至对应Dom元素
   */
  renderTemplate(template, data, pageType, pageSize = null, containerClass = null) {
    if (Object.prototype.toString.call(data) !== '[object Object]' || Object.keys(data).length ===0) {
      console.error('%c [ data ]', 'font-size:13px; background:pink; color:#bf2c9f;', '传入数据异常，必须为对象且不能为空')
      throw new Error('传入数据异常，必须为对象且不能为空')
    }
    let newPageSize = printTool.getPageSize(pageType).px
    if (pageSize) {
      newPageSize = { ...pageSize }
    }
    const { height, paddingTB } = newPageSize
    data.pageSize = {...newPageSize}

    const templateFunc = Handlebars.compile(template);
    const baseTemplate = templateFunc(data);

    const baseDivId = 'baseDivIdForPrintTemplate'
    let baseDivDom = document.querySelector(`#${baseDivId}`)
    if (!baseDivDom) {
      baseDivDom = document.createElement('div')
      baseDivDom.id = baseDivId
    }
    baseDivDom.innerHTML = baseTemplate;
    baseDivDom.style['background-color'] = '#cecece'
    baseDivDom.style.visibility = 'hidden';
    baseDivDom.style.position = 'absolute';
    baseDivDom.style.top = '-100%';
    baseDivDom.style.left = '-100%';
    document.body.appendChild(baseDivDom)

    if (!baseDivDom.children) {
      console.error('%c [ !baseDivDom.children ]', 'font-size:13px; background:pink; color:#bf2c9f;', '模板异常，没有可用元素')
      throw new Error('模板异常，没有可用元素')
    }
    // 生成的内容，大于页面高度，需要分页
    // 获取整个打印内容的容器元素
    const containerDom = Array.from(baseDivDom.children).find(fitem => fitem.tagName === 'DIV')
    
    // 所有打印内容的元素列表，按模板生成的Dom顺序进行排序
    const domArr = []
    // 记录default类型元素，在domArr数组中的下标，用于快速获取非fixed类型元素
    const defaultDomIdxArr = []
    
    let baseRemainingHeight = height - paddingTB * 2

    // 获取打印内容的各个模块的容器元素
    for (const [index, item] of Array.from(containerDom.children).entries()) {
      const {domType = 'default'} = item.dataset
      let itemHeight = item.offsetHeight || 0
      if (domType === 'fixed') {
        baseRemainingHeight -= itemHeight
      } else {
        defaultDomIdxArr.push(index)
      }
      domArr.push({itemDom: item, domType})
    }
    if (baseRemainingHeight < 0) {
      console.error('%c [ baseRemainingHeight ]', 'font-size:13px; background:pink; color:#bf2c9f;', '剩余高度不足，分页错误')
      throw new Error('固定元素导致剩余高度不足，分页错误')
    }
    if (domArr.length === 0) {
      console.error('%c [ domArr.length === 0 ]', 'font-size:13px; background:pink; color:#bf2c9f;', 'dom元素Id数据未正确配置')
      throw new Error('dom元素Id数据未正确配置')
    }
    
    const newTemplateDom = _createTemplateContainer();
    const fillTemplateArr = _fillTemplate(0, {domArr, containerDom, defaultDomIdxArr, baseRemainingHeight}, containerClass)
    for (const item of fillTemplateArr) {
      newTemplateDom.appendChild(item)
    }

    const styleTag = document.createElement('style')
    styleTag.innerHTML = baseDivDom.querySelector('style')?.innerHTML ?? ''
    newTemplateDom.appendChild(styleTag)
    document.body.removeChild(baseDivDom)
    return newTemplateDom.innerHTML;
  },

  renderTemplateForTest(template, data, pageType, pageSize = null) {
    let newPageSize = printTool.getPageSize(pageType).px
    if (pageSize) {
      newPageSize = { ...pageSize }
    }
    const { height, width, padding } = newPageSize
    data.pageSize = {...newPageSize}

    const templateFunc = Handlebars.compile(template);
    return templateFunc(data);
  },

  /**
   * 获取打印纸张的像素尺寸和物理尺寸
   * 像素尺寸用于模板设置，如果存在分页则必须设置准确，否则分页会出错
   * 物理尺寸用于打印位置定位，尺寸错误可能会出现偏移
   * @param {*} type 纸张类型
   * @return {*} 
   */
  getPageSize(type) {
    const sizeObj = pageType[type.toUpperCase()]
    return sizeObj || pageType.A5
  },

  /**
   * 执行lodop打印初始化，调用getLodop()获取lodop实例。
   * api参数参加lodop官方文档
   * @return {*} lodop实例
   */
  getLodop,
}

export default printTool