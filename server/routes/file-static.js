
/**
 * 所有的文件资源请求走这个路由去请求阿里云oss对象存储并返回结果
 * routes = [
 *     ['get', '/abc', fun1, [fun2, fun3, ...]],
 *     ['post', '/abcd', fun1, fun2],
 *     ...
 * ]
 */
var OSSW = require('ali-oss').Wrapper;
var conf = require('../conf')

var ossFileProcessor = async (req, res, next) => {
    try {
        var originalUrl = req.originalUrl
        var ossKey = decodeURIComponent(originalUrl.slice(8))
        const client = new OSSW({
            accessKeyId: conf.ossConf.ossAdminAccessKeyId,
            accessKeySecret: conf.ossConf.ossAdminAccessKeySecret,
            bucket: conf.ossConf.bucket,
            region: conf.ossConf.region
        });
        var result = await client.get(ossKey);
        res.send(result.res.data)
    } catch (error) {
        res.send(404)
    }
}

var ossImgProcessor = async (req, res, next) => {
    try {
        var originalUrl = req.originalUrl
        var ossKey = decodeURIComponent(originalUrl.slice(5))
        //console.log(ossKey)
        const client = new OSSW({
            accessKeyId: conf.ossConf.ossAdminAccessKeyId,
            accessKeySecret: conf.ossConf.ossAdminAccessKeySecret,
            bucket: conf.ossConf.bucket,
            region: conf.ossConf.region
        });
        var infoResult = await client.get(ossKey, {process: 'image/info'})
        var jsobj = JSON.parse(infoResult.content.toString())//将json转化为array数组

        var oriHeight = parseInt(jsobj.ImageHeight.value)
        var oriWidth = parseInt(jsobj.ImageWidth.value)

        var tms = Math.min(parseInt(oriWidth/16),parseInt(oriHeight/9))

        var width = tms*16
        var height = tms*9

        var topMargin = parseInt((oriHeight-height)/2)
        var leftMargin = parseInt((oriWidth-width)/2)
        
        var result = await client.get(ossKey, {process: `image/crop,w_${width},h_${height},x_${leftMargin},y_${topMargin},g_center`});
        res.send(result.res.data)
    } catch (error) {
        res.send(404)
    }
}

module.exports = [
    [0, 'all', /\/static\//, ossFileProcessor],
    [0, 'all', /\/img\//, ossImgProcessor],
];
