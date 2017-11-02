let string = ()=>{
    let s= '',
        ip = fws.localIp,
        listenPort = fws.listenPort;
    if(ip && listenPort){
        let socketServer = `//${ip}:${listenPort}`;
        s = `
<!--fws开发模式start-->
<script>var socketServer = '${socketServer}'</script>
<script src="${socketServer}/staticfile/socket.io/1.7.3/socket.io.js"></script>
<script src="${socketServer}/fws_hot_loader.js"></script>
<!--fws开发模式end-->
        `
    };
    return s;
};
module.exports = string;