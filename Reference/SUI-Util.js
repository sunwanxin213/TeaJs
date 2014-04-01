void function (sui) {
    var util = {};

    var textMetricElement = null;
    window.addEventListener("load", function () {
        textMetricElement = document.createElement("span");
        textMetricElement.style.cssText = "position:absolute;top:-1000px;left:0;z-index:-1000;color:transparent;";
        document.body.appendChild(textMetricElement);
    });

    util.getTextHeight = function (str, font) {
        /// <summary>获取文本高度</summary>
        /// <param name="str" type="String">要获取的字符串</param>
        /// <param name="font" type="String" optional="true">字体</param>
        /// <returns type="Number">高度</returns>

        textMetricElement.style.font = font;
        textMetricElement.textContent = str;
        return textMetricElement.offsetHeight;
    };

    util.getTextWidth = function (str, font) {
        /// <summary>获取文字宽度</summary>
        /// <param name="str" type="String">要获取的字符串</param>
        /// <param name="font" type="String" optional="true">字体</param>
        /// <returns type="Number">宽度</returns>

        textMetricElement.style.font = font;
        textMetricElement.textContent = str;
        return textMetricElement.offsetWidth;
    };

    util.getTextSize = function (str, font) {
        /// <summary>获取文字尺寸</summary>
        /// <param name="str" type="String">要获取的字符串</param>
        /// <param name="font" type="String" optional="true">字体</param>
        /// <returns type="Size">尺寸</returns>

        return {
            width: getTextWidth(str, font),
            height: getTextHeight(str, font)
        }
    };

    sui.util = util;
}(StardustUI.prototype);