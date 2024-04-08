export default printTool;
declare namespace printTool {
    /** 根据传入的模板字符串匹配data数据，生成html模板内容
     * @param {string} template 模板字符串
     * @param {object} data 内容数据
     * @returns {string} 原生html内容
     */
    function renderTemplate(template: string, data: any): string;
    /**
     * 获取打印纸张的像素尺寸和物理尺寸
     * 像素尺寸用于模板设置，如果存在分页则必须设置准确，否则分页会出错
     * 物理尺寸用于打印位置定位，尺寸错误可能会出现偏移
     * @param {*} type 纸张类型
     * @return {*}
     */
    function getPageSize(type: any): any;
}
//# sourceMappingURL=index.d.ts.map