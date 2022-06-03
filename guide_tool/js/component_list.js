var component_exist_list = [], component_exist_num = [], component_each_info = [], inlet = [];

function component_exist(a){
	for (let values of a){
		console.log(values.type);
		var index = component_exist_list.indexOf(values.type);
		if (index < 0) {
			component_exist_list[component_exist_list.length] = values.type;
			component_exist_num[component_exist_num.length] = 1;
			component_each_info[component_each_info.length] = [values];
		}
		else {
			component_exist_num[index] += 1;
			console.log(index);
			component_each_info[index][component_each_info[index].length] = values;
		}
	}
	console.log(component_exist_list);
	console.log(component_exist_num);
	console.log(component_each_info);
}

function creat_component_list(){
	var i = 0;
	for (let value of component_exist_list){
		var new_tr = document.createElement("tr");
		new_tr.innerHTML = "<tr> <td> <p style='font-size:20px;'>" + value + "</p> </td> <td> <p id='size' style='font-size:20px;'" + i + ">" + component_exist_num[i] + "</p> </td> </tr>";
		document.getElementById("tb1").appendChild(new_tr);
		
		new_tr = document.createElement("tr");
		new_tr.innerHTML = "<tr> <td> <button class='button' id='port2' style='font-size:12px;' onclick='color_points(" + i + ")'>"+ component_exist_list[i] 
		+"</button> </td> <td> <p style='font-size:15px;' id='num"+i+"'>" + component_exist_num[i] + "</p> </td> </tr>"
		document.getElementById("tb2").appendChild(new_tr);
		i+=1;
	}
	new_tr = document.createElement("tr");
	new_tr.innerHTML = "<tr> <td> <button class='button' id='port2' style='font-size:12px;' onclick='color_points("+i+")'>Inlet</button> </td> <td> <p style='font-size:15px;' id='num"+i+"'>" + inlet.length + "</p> </td> </tr>"
	document.getElementById("tb2").appendChild(new_tr);
}