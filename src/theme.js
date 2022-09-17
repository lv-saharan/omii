const themeCSSStyleSheet = new CSSStyleSheet()
export default themeCSSStyleSheet
export function setTheme(css) {
    if (typeof css == "string") themeCSSStyleSheet.replace(css)
}