var component_flow = ["Port", "Via", "Valve3D", "DiamondReactionChamber", "Pump3D", "Mixer"];
var component_ctrl = ["Valve3D_control", "Port", "Pump3D_control"]

function splite_json(){
	var features = info.features;
	console.log("flow runs");
	var a = read_data(features, 0, component_flow, flow_info);
	component_exist(flow_info);
	console.log("control runs")
	var b = read_data(features, 1, component_ctrl, ctrl_info);
	component_exist(ctrl_info);
	creat_component_list();
}

function isEmptyObject(obj){
    for (var n in obj) {
        return false
    }
    return true; 
}
function read_data(a,k,l, positions){
	var index_port = 1;
	var index_via = 1;
	var index_channel = 1;
	var index_valve = 1;
	var index_chamber = 1;
	var index_pump = 1;
	var index_mixer = 1;
	console.log(a);
	for (let values of getObjectValues(a[k].features)){
		var dic = {};

		if (values.macro == "Port"){
			
			if (k==1) values.macro = "Port_control";
			dic = {'id': index_port, 'type': values.macro, 'position': values.params.position};
			index_port += 1;
		}	
		else if (values.macro == "Via"){
			dic = {'id': index_via, 'type': values.macro, 'position': values.params.position};
			index_via += 1;

		}
		else if (values.macro == "Valve3D_control"){
			dic = {'id': index_valve, 'type': values.macro, 'position': values.params.position, 'radius':values.params.valveRadius};
			// # 3Duf json file doesn't provide rotation for every valve here.
			// # 1 means vertical, 0 means horizontal
			// # if values['params']['rotation'] == 90: dic['direct'] = 1
			// # else: dic['direct'] = 0
			index_valve += 1;
		}
		else if (values.macro == "Valve3D"){
			dic = {'id': index_valve, 'type': values.macro, 'position': values.params.position, 'radius':values.params.valveRadius};
			// # if values['params']['rotation'] == 90: dic['direct'] = 1
			// # else: dic['direct'] = 0
			index_valve += 1;
		}
		else if (values.macro == "DiamondReactionChamber"){
			dic = {'id': index_chamber, 'type': values.macro, 'position': values.params.position, 'len': values.params.length, 'width': values.params.width};
			index_chamber += 1;
		}
		else if (values.macro == "Pump3D"){
			dic = {'id': index_pump, 'type': values.macro, 'position': values.params.position, 'len': values.params.spacing, 'radius':values.params.valveRadius};
			if (values.params.rotation == 90) dic['direct'] = 0;
			else if (values.params.rotation == 0) dic['direct'] = 1;
			else dic['direct'] = 2;
			index_pump += 1;
		}
		else if (values.macro == "Pump3D_control"){
			dic = {'id': index_pump, 'type': values.macro, 'position': values.params.position, 'len': values.params.spacing, 'radius':values.params.valveRadius};
			if (values.params.rotation == 90) dic['direct'] = 0;
			else dic['direct'] = 1;
			index_pump += 1;
		}
		else if (values.macro.indexOf("Mixer") >= 0){
			var len=0, wid=0, p0=0, p1=0;
			if (values.params.rotation == 0){
				
				len = values.params.bendSpacing * values.params.numberOfBends * 2 + values.params.channelWidth * (values.params.numberOfBends * 2 + 1);
				wid = values.params.bendLength + values.params.channelWidth * 2;
				p0 = values.params.position[0] + wid / 2;
				p1 = values.params.position[1] + len / 2;
				console.log(p0,p1);
			}
			else{
				len = values.params.bendSpacing + values.params.channelWidth * 2;
				wid = values.params.bendLength * values.params.numberOfBends + values.params.channelWidth * (values.params.numberOfBends * 2 + 1);
				p0 = values.params.position[0] - wid / 2;
				p1 = values.params.position[1] + len / 2;
				console.log(p0,p1);
			}
			dic = {'id': index_mixer, 'type': "Mixer", 'position': [p0, p1], 'len': len, 'width': wid};
			index_mixer += 1;
		}
		if (!isEmptyObject(dic)) positions[positions.length]=dic;
		
		if (values.macro == "RoundedChannel" || values.macro == "Connection"){
			len_0 = values.params.start[0] - values.params.end[0]
			// # length in horizontal
			len_1 = values.params.start[1] - values.params.end[1] 
			// # length in vertical
			// # confirm start is on the left of line segment. If it is vertical, make the start point be on the top.
			if (((len_0 >= 0 && len_1 >= 0) && !(len_0==0 && len_1==0)) || (len_0>0 && len_1<0))
				dic = {'id': index_channel, 'type': values['macro'], 'start':values['params']['end'], 'end': values['params']['start']}
			else dic = {'id': index_channel, 'type': values['macro'], 'start':values['params']['start'], 'end': values['params']['end']}
			
			// vertical value is 0 means that segment is horizontal. dicrect = 0 means horizontal, direct = 1 means vertical
			if (len_1 == 0) dic['direct'] = 0
			else if (len_0 == 0) dic['direct'] = 1;
			else dic['direct'] = 2;
			index_channel += 1;
			positions[positions.length] = dic;
		}
	}

}
function getObjectKeys(object)
{
	var keys = [];
	for (var property in object)
		keys.push(property);
	return keys;
}

function getObjectValues(object)
{
	var values = [];
	for (var property in object)
		values.push(object[property]);
	return values;
}

// upload json
function read() {
	var f=document.getElementById('file').files[0];
	var r= new FileReader();
	point_path = [], ctrl_info = [], flow_info = [], last_outport = [], last_point = [], path_ctrl_info = [], index_ctrl_port = [],info=[];
	component_each_info = [], component_exist_num=[], component_exist_list = [];
	document.getElementById("tb1").innerHTML = "";
	document.getElementById("tb2").innerHTML = "";
	r.onload=function() {
		info = JSON.parse(this.result);
		// elements in array: flow: index_port, index_pump, index_valve, index_via, index_chamber, repeat once for control.
		splite_json();

		new_grapgh();
	};
	r.readAsText(f,"UTF-8");
}