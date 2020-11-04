var mode_num = 0;
// record points we chose
var point_path = [];
var ctrl_info = [];
var flow_info = [];
var last_outport = [];
var last_point = [];
var path_ctrl_info = [];
function mode(i)
{
    s = ["1-Loading cells in each inlet independently from MUX\n" ,
    "2-Cleaning of all main channels and the reservoir after cell loading\n" ,
    "3-Filling in the reservoirs with no operation to bring anything to any inlets (only reservoirs), followed by cleaning of needed\n" ,
    "4-Cleaning of all main channels after reservoir filling\n" ,
    "5-Both inlets of a MCM receive media from the reservoirs independent and simultaneously with MUX closed\n" ,
    "6-Feeding inlets from reservoirs stopped, then reservoirs receive media from MUX one at the time for re-filing\n" ,
    "7-Final cleaning of all channels after experiments are gone, and MCMs are removed. (Open all of the valves)\n"];
    document.getElementById("modes_introduction").innerHTML = s[i-1]
}

function draw_pump(ctx, info, i, color)
{
    ctx.beginPath();
    ctx.strokeStyle=color;
    ctx.arc(info[i].position[0]/100-info[i].len/100, info[i].position[1]/100, 10, 0, 2*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle=color;
    ctx.arc(info[i].position[0]/100, info[i].position[1]/100, 10, 0, 2*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle=color;
    ctx.arc(info[i].position[0]/100+info[i].len/100, info[i].position[1]/100, 10, 0, 2*Math.PI);
    ctx.stroke();
}

function text_fill(ctx, info, i, color)
{
    ctx.strokeStyle=color;
    ctx.font="bold 14px Arial";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillStyle="black";
    ctx.fillText( info[i].id,info[i].position[0]/100, info[i].position[1]/100);
}

function draw_bk(ctx, info, flag, color1, color2)
{
    if (flag ==1)
    {
        for(var i=0;i<info.length;i++){
            ctx.lineWidth=3;
            if (info[i].type == "RoundedChannel") {
                ctx.beginPath();
                ctx.strokeStyle=color1;
                ctx.moveTo(info[i].start[0]/100, info[i].start[1]/100);
                ctx.lineTo(info[i].end[0]/100, info[i].end[1]/100);
                ctx.stroke();
            } else if (info[i].type == "DiamondReactionChamber"){
                ctx.beginPath();
                ctx.fillStyle=color1;
                ctx.fillRect(info[i].position[0]/100-info[i].width/200, info[i].position[1]/100-info[i].len/200, info[i].width/100,info[i].len/100);
                ctx.stroke();
            } else if (info[i].type == "Valve3D"){
                ctx.beginPath();
                ctx.strokeStyle=color1;
                ctx.arc(info[i].position[0]/100, info[i].position[1]/100, 10, 0, 2*Math.PI);
                text_fill(ctx, info, i, color1);
                ctx.stroke();
            }else if (info[i].type == "Pump3D"){
                draw_pump(ctx, info, i, color1);
                text_fill(ctx, info, i, color1);
            }
            else{
                ctx.beginPath();
                text_fill(ctx, info, i, color1);
                ctx.arc(info[i].position[0]/100, info[i].position[1]/100, 10, 0, 2*Math.PI);
                ctx.stroke();
            }
        }
    }else{
        for(var i=0;i<info.length;i++){
            ctx.lineWidth=3;
            if (info[i].type == "RoundedChannel") {
                ctx.beginPath();
                ctx.strokeStyle=color2;
                ctx.moveTo(info[i].start[0]/100, info[i].start[1]/100);
                ctx.lineTo(info[i].end[0]/100, info[i].end[1]/100);
                ctx.stroke();
            } else if (info[i].type == "Pump3D_control"){
                draw_pump(ctx, info, i, color2)
            } else {
                ctx.beginPath();
                ctx.strokeStyle=color2;
                ctx.arc(info[i].position[0]/100, info[i].position[1]/100, 10, 0, 2*Math.PI);
                text_fill(ctx, info, i, color2);
                ctx.stroke();
            }
        }
    }
}

function new_grapgh()
{
    var c=document.getElementById("myCanvas");
    var ctx=c.getContext("2d");

    $.getJSON("data/My-Device-V0-flow.json", function (data) {
        flow_info=data;
        draw_bk(ctx,flow_info,1,"blue","red");
    });

    $.getJSON("data/My-Device-V0-control.json", function (data) {
        ctrl_info=data;
        draw_bk(ctx, ctrl_info,2,"blue","red");
    });
}

function choosepoint(){

    var objTop = getOffsetTop(document.getElementById("myCanvas"));
    var objLeft = getOffsetLeft(document.getElementById("myCanvas"));

    var mouseX = event.clientX+document.documentElement.scrollLeft;
    var mouseY = event.clientY+document.documentElement.scrollTop;

    var objX = mouseX-objLeft;
    var objY = mouseY-objTop;

    clickObjPosition = objX + "," + objY;
    alert_word = "Position: " + clickObjPosition;
    alert(alert_word);

    var min = 100000000;
    var min_id = 0;
    var min_position;
    var distance = 0;
    var min_type;
    for(var i=0; i<flow_info.length; i++){
        if (flow_info[i].type =="Port") {
            distance = Math.abs(objX - flow_info[i].position[0]/100) + Math.abs(objY - flow_info[i].position[1]/100);
            if (distance < min){
                min = distance;
                min_id = flow_info[i].id;
                min_position = flow_info[i].position;
                min_type = flow_info[i].type;
            }
        }
    }
    if (min_id!=0) point_path[point_path.length] = min_id ;
    document.getElementById("positionShow").innerHTML = "Position you chose: " + clickObjPosition + ";  Port Index: " +
        min_type + "_" + min_id + ";  Port Position: " + min_position[0]/100 + "," + min_position[1]/100 + ". <br><br>"+
        "Point indexes: " + point_path;
}

function getOffsetTop(obj){
    var tmp = obj.offsetTop;
    var val = obj.offsetParent;
    while(val != null){
        tmp += val.offsetTop;
        val = val.offsetParent;
    }
    return tmp;
}
function getOffsetLeft(obj){
    var tmp = obj.offsetLeft;
    var val = obj.offsetParent;
    while(val != null){
        tmp += val.offsetLeft;
        val = val.offsetParent;
    }
    return tmp;
}

function searchPath(path_info, channel_flow, block_valve, via_valve, mid_valve, chamber_valve, pump_block, num_port,level){
    // flag is a remark of finding the path.
    var flag = 0;
    var t = num_port;
    var path_ctrl_info = [];

    // find the other paths
    while (t < path_info.length){
        if (flag < t) {
            flag = t;
        }else {
            console.log(t);
            console.log(path_info);
            if (t != 0)
                if (t < path_info.length-1) t += 1;
                else break; // when t = 0 means it is going to draw the first control line beside the valves.
        }
        for(var j=0; j < channel_flow.length; j++) {

            // if channel_flow[j] is empty, that means it is chosen into path_flow
            if (channel_flow[j].length == 0) continue;
            // start is on the head and left of end point
            // last path may be a channel
            else if (path_info[t].type == "RoundedChannel") {
                // next may be a line
                if (channel_flow[j].type == "RoundedChannel") {

                    if (channel_flow[j].direct == path_info[t].direct) {
                        // same direction
                        if (path_info[t].direct == 1) {
                            // two lines are both vertical
                            if ((path_info[t].start[1] <= channel_flow[j].start[1] && channel_flow[j].start[1] <= path_info[t].end[1]
                                    && path_info[t].end[1] <= channel_flow[j].end[1] && path_info[t].start[0] == channel_flow[j].start[0] ) ||
                                (channel_flow[j].start[1] <= path_info[t].start[1] && path_info[t].start[1] <= channel_flow[j].end[1]
                                    && channel_flow[j].end[1] <= path_info[t].end[1]) && path_info[t].start[0] == channel_flow[j].start[0]) {

                                //after finding the next line, we need to add that to path_info[] and delete info in channel_flow[] .
                                path_info[path_info.length] = channel_flow[j];
                                channel_flow[j] = [];

                            } else continue;
                        }
                        // two lines are both horizontal
                        else {
                            if ((path_info[t].start[0] <= channel_flow[j].start[0] && channel_flow[j].start[0] <= path_info[t].end[0]
                                    && path_info[t].end[0] <= channel_flow[j].end[0] && path_info[t].start[1] == channel_flow[j].start[1] ) ||
                                (channel_flow[j].start[0] <= path_info[t].start[0] && path_info[t].start[0] <= channel_flow[j].end[0]
                                    && channel_flow[j].end[0] <= path_info[t].end[0] && path_info[t].start[1] == channel_flow[j].start[1])) {
                                path_info[path_info.length] = channel_flow[j];
                                channel_flow[j] = [];

                            } else continue;
                        }
                    }
                    //different direction
                    else {
                        if (path_info[t].direct == 1) {

                            if (channel_flow[j].start[0] <= path_info[t].end[0] && channel_flow[j].end[0] >= path_info[t].end[0] &&
                                channel_flow[j].start[1] <= path_info[t].end[1] && channel_flow[j].start[1] >= path_info[t].start[1]) {
                                path_info[path_info.length] = channel_flow[j];
                                channel_flow[j] = [];

                            }
                        }
                        else {
                            if (channel_flow[j].start[0] >= path_info[t].start[0] && channel_flow[j].start[0] <= path_info[t].end[0] &&
                                channel_flow[j].start[1] <= path_info[t].end[1] && channel_flow[j].end[1] >= path_info[t].end[1]) {
                                path_info[path_info.length] = channel_flow[j];
                                channel_flow[j] = [];

                            }
                        }
                    }
                }
                if (t == 4 && level == 2) console.log(channel_flow[j],path_info[t]);
                // next may be a valve
                if (channel_flow[j].type == "Valve3D" || channel_flow[j].type == "Valve3D_control" || channel_flow[j].type == "Port") {

                    // judge channel_flow[j] is in the block array
                    if (block_valve.indexOf(channel_flow[j].id) != -1 || chamber_valve.indexOf(channel_flow[j].id) != -1 ||
                        via_valve.indexOf(channel_flow[j].id) != -1 || mid_valve.indexOf(channel_flow[j].id) != -1) continue;
                    // vertical line (vs.) valve, we need to change the valve into a vertical line segment.
                    if (path_info[t].direct == 1) {
                        var start = channel_flow[j].position[1] - 1000;
                        var end = channel_flow[j].position[1] + 1000;

                        if ((( path_info[t].start[1] <= start && start <= path_info[t].end[1] && path_info[t].end[1] <= end)||
                            (start <= path_info[t].start[1] && path_info[t].start[1] <= end && end <= path_info[t].end[1])||
                            (start <= path_info[t].start[1] && path_info[t].end[1] <= end) ||
                            (start >= path_info[t].start[1] && path_info[t].end[1] >= end))
                                && path_info[t].start[0] == channel_flow[j].position[0]) {
                            path_ctrl_info[path_ctrl_info.length] = channel_flow[j];
                            path_info[path_info.length] = channel_flow[j];
                            channel_flow[j] = [];
                        }
                    }
                    else {
                        // horizontal line (vs.) valve, we need to change the valve into a horizontal line segment.

                        var start = channel_flow[j].position[0] - 1000;
                        var end = channel_flow[j].position[0] + 1000;

                        if ((( path_info[t].start[0] <= start && start <= path_info[t].end[0] && path_info[t].end[0] <= end)||
                            (start <= path_info[t].start[0] && path_info[t].start[0] <= end && end <= path_info[t].end[0])||
                            (start <= path_info[t].start[0] && path_info[t].end[0] <= end) ||
                            (start >= path_info[t].start[0] && path_info[t].end[0] >= end))
                                && path_info[t].start[1] == channel_flow[j].position[1]) {
                            path_ctrl_info[path_ctrl_info.length] = channel_flow[j];
                            path_info[path_info.length] = channel_flow[j];
                            channel_flow[j] = [];
                        }
                    }
                }

                // next may be a pump
                if (channel_flow[j].type == "Pump3D" || channel_flow[j].type == "Pump3D_control") {
                    // if pump id exist in pump_block, then skip this j
                    if (pump_block.indexOf(channel_flow[j].id) != -1 ){
                        continue;
                    }
                    // if a vertical line compare with pump, we need to change the pump into a vertical line segment.
                    if (path_info[t].direct == 1 && channel_flow[j].direct == 1) {
                        // +/- 500 here aims to add the radius of the edge valve of the pump
                        var start = channel_flow[j].position[1] - channel_flow[j].len - 500;
                        var end = channel_flow[j].position[1] + channel_flow[j].len + 500;

                        if (( path_info[t].start[1] <= start && start <= path_info[t].end[1] && path_info[t].end[1] <= end
                                && path_info[t].start[0] == channel_flow[j].position[0]) ||
                            (start <= path_info[t].start[1] && path_info[t].start[1] <= end && end <= path_info[t].end[1]
                                && path_info[t].start[0] == channel_flow[j].position[0])) {
                            path_ctrl_info[path_ctrl_info.length] = channel_flow[j];
                            path_info[path_info.length] = channel_flow[j];
                            channel_flow[j] = [];
                        }
                    }
                    else if (path_info[t].direct == 0 && channel_flow[j].direct == 0) {
                        // if a horizontal line compare with pump, we need to change the pump into a horizontal line segment.
                        var start = channel_flow[j].position[0] - channel_flow[j].len - 500;
                        var end = channel_flow[j].position[0] + channel_flow[j].len + 500;
                        if (( path_info[t].start[0] <= start && start <= path_info[t].end[0] && path_info[t].end[0] <= end
                                && path_info[t].start[1] == channel_flow[j].position[1]) ||
                            (start <= path_info[t].start[0] && path_info[t].start[0] <= end && end <= path_info[t].end[0]
                                && path_info[t].start[1] == channel_flow[j].position[1])) {
                            path_ctrl_info[path_ctrl_info.length] = channel_flow[j];
                            path_info[path_info.length] = channel_flow[j];
                            channel_flow[j] = [];
                        }
                    }
                }

                // next may be a diamond
                if (channel_flow[j].type == "DiamondReactionChamber") {
                    if (path_info[t].direct == 1) {
                        var start = channel_flow[j].position[1] - channel_flow[j].len/2;
                        var end = channel_flow[j].position[1] + channel_flow[j].len/2;

                        if (( path_info[t].start[1] <= start && start <= path_info[t].end[1] && path_info[t].end[1] <= end
                                && path_info[t].start[0] == channel_flow[j].position[0]) ||
                            (start <= path_info[t].start[1] && path_info[t].start[1] <= end && end <= path_info[t].end[1]
                                && path_info[t].start[0] == channel_flow[j].position[0])) {
                            path_info[path_info.length] = channel_flow[j];
                            channel_flow[j] = [];
                        }
                    }else continue;
                }
            }

            // last path may be a valve
            else if (path_info[t].type == "Valve3D"||path_info[t].type == "Valve3D_control" || path_info[t].type == "Port"){
                    // next may be a line
                    if (channel_flow[j].type == "RoundedChannel") {
                        // vertical line (vs.) valve, we need to change the valve into a vertical line segment.
                        if (channel_flow[j].direct == 1) {
                            var start = path_info[t].position[1] - 1000;
                            var end = path_info[t].position[1] + 1000;

                            if ((( channel_flow[j].start[1] <= start && start <= channel_flow[j].end[1] && channel_flow[j].end[1] <= end) ||
                                (start <= channel_flow[j].start[1] && channel_flow[j].start[1] <= end && end <= channel_flow[j].end[1]) ||
                                (start <= channel_flow[j].start[1] && channel_flow[j].end[1] <= end ) ||
                                (start >= channel_flow[j].start[1] && channel_flow[j].end[1] >= end ))
                                    && channel_flow[j].start[0] == path_info[t].position[0]){
                                path_info[path_info.length] = channel_flow[j];
                                channel_flow[j] = [];

                            }
                        }
                        else {
                            // horizontal line (vs.) valve, we need to change the valve into a horizontal line segment.
                            var start = path_info[t].position[0] - 1000;
                            var end = path_info[t].position[0] + 1000;
                            if ((( channel_flow[j].start[0] <= start && start <= channel_flow[j].end[0] && channel_flow[j].end[0] <= end) ||
                                (start <= channel_flow[j].start[0] && channel_flow[j].start[0] <= end && end <= channel_flow[j].end[0]) ||
                                (start <= channel_flow[j].start[0] && channel_flow[j].end[0] <= end ) ||
                                (start >= channel_flow[j].start[0] && channel_flow[j].end[0] >= end ))
                                    && channel_flow[j].start[1] == path_info[t].position[1]) {
                                path_info[path_info.length] = channel_flow[j];
                                channel_flow[j] = [];

                            }
                        }
                    }
                }
            // last path may be a pump
            else if (path_info[t].type == "Pump3D" || path_info[t].type == "Pump3D_control" ){
                    if (channel_flow[j].type == "RoundedChannel") {
                        // vertical line (vs.) valve, we need to change the valve into a vertical line segment.
                        if (channel_flow[j].direct == 1 && path_info[t].direct == 1) {
                            var start = path_info[t].position[1] - path_info[t].len - 500;
                            var end = path_info[t].position[1] + path_info[t].len + 500;

                            if (( channel_flow[j].start[1] <= start && start <= channel_flow[j].end[1] && channel_flow[j].end[1] <= end
                                    && channel_flow[j].start[0] == path_info[t].position[0]) ||
                                (start <= channel_flow[j].start[1] && channel_flow[j].start[1] <= end && end <= channel_flow[j].end[1]
                                    && channel_flow[j].start[0] == path_info[t].position[0])) {
                                path_info[path_info.length] = channel_flow[j];
                                channel_flow[j] = [];

                            }
                        }
                        else if (channel_flow[j].direct == 0 && path_info[t].direct == 0){
                            // horizontal line (vs.) valve, we need to change the valve into a horizontal line segment.
                            var start = path_info[t].position[0] - path_info[t].len - 500;
                            var end = path_info[t].position[0] + path_info[t].len + 500;

                            if (( channel_flow[j].start[0] <= start && start <= channel_flow[j].end[0] && channel_flow[j].end[0] <= end
                                    && channel_flow[j].start[1] == path_info[t].position[1]) ||
                                (start <= channel_flow[j].start[0] && channel_flow[j].start[0] <= end && end <= channel_flow[j].end[0]
                                    && channel_flow[j].start[1] == path_info[t].position[1])) {
                                path_info[path_info.length] = channel_flow[j];
                                channel_flow[j] = [];

                            }
                        }
                    }
                }
            // last path may be a diamond chamber

            else{
                if (channel_flow[j].type == "RoundedChannel") {
                    // vertical line (vs.) valve, we need to change the valve into a vertical line segment.
                    if (channel_flow[j].direct == 1) {
                        var start = path_info[t].position[1] - path_info[t].len/2;
                        var end = path_info[t].position[1] + path_info[t].len/2;
                        if (( channel_flow[j].start[1] <= start && start <= channel_flow[j].end[1] && channel_flow[j].end[1] <= end
                                && channel_flow[j].start[0] == path_info[t].position[0]) ||
                            (start <= channel_flow[j].start[1] && channel_flow[j].start[1] <= end && end <= channel_flow[j].end[1]
                                && channel_flow[j].start[0] == path_info[t].position[0])) {
                            path_info[path_info.length] = channel_flow[j];
                            channel_flow[j] = [];
                        }
                    }
                }
            }
        }
        t++;
    }
    if (level!=2) console.log(path_info)
    if (level != 2) return path_ctrl_info;
    else return path_info;
}

function newCanvas(level){

    var c=document.getElementById("newCanvas");
    var ctx=c.getContext("2d");
    var mode_num = document.getElementById("modes_introduction").innerHTML[0];
    console.log(mode_num);

    var port_flow = [];
    var channel_flow = [];
    var ctrl_channel = [];
    // pretreatment
    for(var j=0; j < flow_info.length; j++){
        if (flow_info[j].type == "Port") port_flow[port_flow.length] = flow_info[j];
        else channel_flow[channel_flow.length] = flow_info[j];
    }

    for(var j=0; j < ctrl_info.length; j++){
        ctrl_channel[ctrl_channel.length] = ctrl_info[j];
    }

    draw_bk(ctx, flow_info,1,"white","white");
    draw_bk(ctx, ctrl_info,2,"white","white");
    var path_info = [];
    var num_port = 0;
    // this array is used to block the valves we don't want it open, or the opposite
    var block_valve = [5,6,7,8,13,15,14,16,19];
    var outlet_port = [2,1];
    var via_valve = [17,18];
    var mid_valve = [];
    var pump_block = []; // if 0, means that pump should be open
    if (mode_num == 2) point_path = [7, 11];

    if (point_path.length == 0){
        point_path = last_point.slice(0);
    }
    // pre-action
    last_point = point_path.slice(0);
    for (var i = 0; i < point_path.length; i++) {

        // p is the index of chosen point in outlet_port
        var p = outlet_port.indexOf(point_path[i]);
        if (p != -1) {
            via_valve[p] = 0;
        }
        else block_valve[point_path[i] - 3] = 0;
        console.log(point_path,p)
    }
    console.log(via_valve)
    // save the current outport, prepare for the cleaning process when the current operation is not cleaning
    if ( mode_num != 2) {
        last_outport = [];
        for (var i = 0; i < point_path.length; i++) {
            if (outlet_port.indexOf(point_path[i]) != -1) {
                last_outport[last_outport.length] = point_path[i];
            }
        }
    }

    console.log(last_outport)

    // find input and output and delete output port when mode_num is 3
    for (var j = 0; j < port_flow.length; j++) {
        for (var i = 0; i < point_path.length; i++) {

            if (port_flow[j].id == point_path[i]) {
                path_info[path_info.length] = port_flow[j];
                num_port++;
            }
        }
        if (num_port == point_path.length) break;
    }

    // do as different mode
    if (mode_num == 1) {
        mid_valve = [12, 13, 14, 15, 16];
        for (var i = 0; i < point_path.length; i++) {
            var p = outlet_port.indexOf(point_path[i]);
            if (p != -1) pump_block[Math.floor(p / 2)] = 0;
        }
    } else if (mode_num == 2) {
        for (var i = 0; i < last_outport.length; i++) {
            var index = outlet_port.indexOf(last_outport[i]);
            if (index != -1) {
                pump_block[Math.floor(index / 2)] = 0;
            }
        }
    }
    num_port = 0;
    for (var j = 0; j < channel_flow.length; j++) {

        if (channel_flow[j].type == "RoundedChannel") {
            for (var i = 0; i < point_path.length; i++) {
                {
                    if (channel_flow[j].length == 0) continue;
                    if ((channel_flow[j].start[0] == path_info[i].position[0] && channel_flow[j].start[1] == path_info[i].position[1])
                        || (channel_flow[j].end[0] == path_info[i].position[0] && channel_flow[j].end[1] == path_info[i].position[1])) {
                        path_info[path_info.length] = channel_flow[j];
                        channel_flow[j] = [];
                        num_port++;
                    }
                }
            }
        }
        if (num_port == point_path.length) break;
    }
    // search flow path
    path_ctrl_info = searchPath(path_info,channel_flow,block_valve,via_valve,mid_valve,[],pump_block,num_port, 1);

    if (level == 1 || level ==3) {
        // find first paths
        draw_bk(ctx, path_info, 1, "blue", "red");
    }

    // search control path
    if (level == 2 || level ==3){
        for(var i=0; i<path_ctrl_info.length;i++){
            if (path_ctrl_info[i].type == "Valve3D") path_ctrl_info[i].type = "Valve3D_control";
            if (path_ctrl_info[i].type == "Pump3D") path_ctrl_info[i].type = "Pump3D_control";
        }
        // search control path
        path_ctrl_info = searchPath(path_ctrl_info,ctrl_channel,[],[],[],[],[],0,2);
        draw_bk(ctx, path_ctrl_info, 2, "blue", "red");
        var index_ctrl_port = []
        for (var i=0; i<path_ctrl_info.length;i++){
            if (path_ctrl_info[i].type == "Port") index_ctrl_port[index_ctrl_port.length] = path_ctrl_info[i].id;
        }
        console.log(index_ctrl_port)
        downloadTxt("control_solenoids.txt",index_ctrl_port);
    }
    console.log(ctrl_channel)
    document.getElementById("positionShow").innerHTML = "Position";
    point_path = []
}

function downloadTxt(fileName, content) {
    var a = document.createElement('a');
    var message = "";
    for (var i =0; i<content.length; i++){
        message += "valve " + content[i] + " open \n";
    }
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(message);
    a.download = fileName
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}