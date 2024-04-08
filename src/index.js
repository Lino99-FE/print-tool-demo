import Handlebars from "handlebars";

// 普通纸:常用纸尺寸
const pageType = {
  A4: {
    px: {
      width: 795,
      height: 1123,
      padding: 20,
    },
    mm: { // 非必须，仅是为了增加物理参照
      width: 210,
      height: 297
    }
  },
}

const createTemplateContainer = () => {
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


const fillTemplate = (currentDefaultDomArrIdx,  baseArgs, pageIndex = 1) => {
  console.log('%c [ pageIndex ]-33', 'font-size:13px; background:pink; color:#bf2c9f;', `第${pageIndex}页`)
  const {domArr, containerDom, defaultDomIdxArr, baseRemainingHeight} = baseArgs
  const resultArr = []

  // 创建临时dom元素用于分页高度计算,完成计算后在方法结尾进行移除
  const tmpDom = document.createElement('div')
  tmpDom.style.position = 'absolute'
  tmpDom.style.top = `-${baseRemainingHeight}px`
  document.body.appendChild(tmpDom)

  let pageRemainingHeight = baseRemainingHeight
  const container = containerDom.cloneNode(false)
  container.classList.add('print-preview-container')
  // 目前正在执行填充的非fixed元素在domArr数组中的索引
  for (const [idx, item] of domArr.entries()) {
    const defaultDomIdx = defaultDomIdxArr[currentDefaultDomArrIdx]
    const {itemDom, domType} = item
    if (domType === 'fixed') {
      container.appendChild(itemDom.cloneNode(true))
    } else if (idx === defaultDomIdx) {
      const itemHeight = itemDom.offsetHeight || 0
      // 当前需要填充的元素，需要进行是否分页的处理
      if (pageRemainingHeight - itemHeight > 0) {
        // 无需分页,直接添加至页面, currentDefaultDomArrIdx指向下一个需要填充的元素
        currentDefaultDomArrIdx +=1
        const itemDomTmp = itemDom.cloneNode(true)
        // 最后一个元素，需要判断是否还有剩余高度，如果有则需要填充避免出现页脚跟随浮动上来
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
          if (itemDom.children[0].offsetHeight > pageRemainingHeight) {
            console.error('%c [ !baseDivDom.children ]', 'font-size:13px; background:pink; color:#bf2c9f;', '模板异常，单个子元素高度超出可以使用高度,请检查元素结构')
            throw new Error('模板异常，单个子元素高度超出可以使用高度')
          }
          const childItem = itemDom.removeChild(itemDom.children[0])
          tmpDomPageDom.appendChild(childItem.cloneNode(true))
          // 一旦超出当前页高度，则停止添加,进行新一页的组装
          if (tmpDom.offsetHeight > pageRemainingHeight) {
            itemDom.insertBefore(childItem, itemDom.children[0])
            // 开启新的一页，继续写入剩余内容
            resultArr.unshift(...fillTemplate(currentDefaultDomArrIdx, baseArgs, pageIndex+1))
            pageContainerDom.style.height = `${pageRemainingHeight}px`
            break;
          }
          pageContainerDom.appendChild(childItem.cloneNode(true))
        }
        container.appendChild(pageContainerDom)
      }
    }
  }
  document.body.removeChild(tmpDom)
  resultArr.unshift(container)
  return resultArr
}


const printTool = {
  /** 根据传入的模板字符串匹配data数据，生成html模板内容
   * @param {string} template 模板字符串
   * @param {object} data 内容数据
   * @param {string} pageType 打印纸张类型
   * @param {object} pageSize 自定义纸张的尺寸,宽、高、边距，eg: {width: xxx, height: xxx, padding： xx}
   * @returns {string} 原生html内容,直接append至对应Dom元素
   */
  renderTemplate(template, data, pageType, pageSize = null) {
    let newPageSize = printTool.getPageSize(pageType).px
    if (pageSize) {
      newPageSize = { ...pageSize }
    }
    const { height, width, padding } = newPageSize
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
    baseDivDom.style.top = `-${height}px`;
    baseDivDom.style.left = `-${width}px`;
    document.body.appendChild(baseDivDom)
    
    if (baseDivDom.offsetHeight < height) {
      return baseTemplate
    }

    if (!baseDivDom.children) {
      console.error('%c [ !baseDivDom.children ]', 'font-size:13px; background:pink; color:#bf2c9f;', '模板异常，没有可用元素')
      throw new Error('模板异常，没有可用元素')
    }
    // 生成的内容，大于页面高度，需要分页
    // 获取整个打印内容的容器元素
    const containerDom = Array.from(baseDivDom.children).find(fitem => fitem.tagName === 'DIV')
    
    const domArr = []
    const defaultDomIdxArr = []
    
    let baseRemainingHeight = height - padding * 2

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
    console.log('%c [ domArr ]-93', 'font-size:13px; background:pink; color:#bf2c9f;', domArr)
    if (baseRemainingHeight < 0) {
      console.error('%c [ baseRemainingHeight ]', 'font-size:13px; background:pink; color:#bf2c9f;', '剩余高度不足，分页错误')
      throw new Error('固定元素导致剩余高度不足，分页错误')
    }
    if (domArr.length === 0) {
      console.error('%c [ domArr.length === 0 ]', 'font-size:13px; background:pink; color:#bf2c9f;', 'dom元素Id数据未正确配置')
      throw new Error('dom元素Id数据未正确配置')
    }
    

    // 正常堆叠内容元素
    // 情况1：当前元素的高度小于剩余高度，直接添加到当前页面
    // 情况2：当前元素的高度大于剩余高度，需要分页,不仅仅是针对page，default元素也需要判断是否满足当前也放置，目前对于放置不下的处理方式为整块元素放到下一页
    // 分页逻辑：当前页剩余高度--需要注意不一定是全部可用高度(baseRemainingHeight)，
    // 根据page内容元素的高度减掉当前页元素高度，判断剩余高度》0或还有剩余内容元素，则需要添加新一页，贴上fixed元素
    // 剩余高度>0,需要分页，利用cloneNode复制page的容器元素，继续append剩余子元素
    const newTemplateDom = createTemplateContainer();
    const fillTemplateArr = fillTemplate(0, {domArr, containerDom, defaultDomIdxArr, baseRemainingHeight})
    for (const item of fillTemplateArr) {
      newTemplateDom.appendChild(item)
    }

    const styleTag = document.createElement('style')
    styleTag.innerHTML = baseDivDom.querySelector('style').innerHTML
    newTemplateDom.appendChild(styleTag)

    document.body.removeChild(baseDivDom)
    return newTemplateDom.innerHTML;
    // return baseDivDom;
  },

  renderTemplateWithoutCalc(template, data, pageType, pageSize = null) {
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
    const sizeObj = pageType[type.toLowerCase()]
    return sizeObj || pageType.A4
  }
}

export default printTool