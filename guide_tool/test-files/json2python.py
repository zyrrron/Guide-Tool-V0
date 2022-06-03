import json
import math

def read_data(a, k, l, d):
    positions = []
    index_port = 1
    index_via = 1
    index_channel = 1
    index_valve = 1
    index_chamber = 1
    index_pump = 1

    for values in a[k]['features'].values():
        dic = {}
        if values['macro'] in l:

            if values['macro'] == "Port":
                dic = {'id': index_port, 'type': values['macro'], 'position': values['params']['position']}
                index_port += 1
            elif values['macro'] == "Via":
                dic = {'id': index_via, 'type': values['macro'], 'position': values['params']['position']}
                index_via += 1
            elif values['macro'] == "Valve3D_control":
                dic = {'id': index_valve, 'type': values['macro'], 'position': values['params']['position'], 'radius':values['params']['valveRadius']}
                # 3Duf json file doesn't provide rotation for every valve here.
				# 1 means vertical, 0 means horizontal
                # if values['params']['rotation'] == 90: dic['direct'] = 1
                # else: dic['direct'] = 0
                index_valve += 1
            elif values['macro'] == "Valve3D":
                dic = {'id': index_valve, 'type': values['macro'], 'position': values['params']['position'], 'radius':values['params']['valveRadius']}
                # if values['params']['rotation'] == 90: dic['direct'] = 1
                # else: dic['direct'] = 0
                index_valve += 1
            elif values['macro'] == "DiamondReactionChamber":
                dic = {'id': index_chamber, 'type': values['macro'], 'position': values['params']['position'],
                       'len': values['params']['length'], 'width': values['params']['width']}
                index_chamber += 1
            elif values['macro'] == "Pump3D":
                dic = {'id': index_pump, 'type': values['macro'], 'position': values['params']['position'], 'len': values['params']['spacing'],
                       'radius':values['params']['valveRadius']}
                if values['params']['rotation'] == 90: dic['direct'] = 0
                else: dic['direct'] = 1
                index_pump += 1
            elif values['macro'] == "Pump3D_control":
                dic = {'id': index_pump, 'type': values['macro'], 'position': values['params']['position'], 'length': values['params']['spacing'],
                       'radius':values['params']['valveRadius']}
                if values['params']['rotation'] == 90: dic['direct'] = 0
                else: dic['direct'] = 1
                index_pump += 1
            positions.append(dic)

        if values['macro'] == "RoundedChannel":
            len_0 = values['params']['start'][0] - values['params']['end'][0]
            # length in vertical
            len_1 = values['params']['start'][1] - values['params']['end'][1]
            # length in horizontal
            # confirm start is on the head and left of line segment
            if (len_0 == 0 and len_1 > 0) or (len_1 == 0 and len_0 > 0):
                dic = {'id': index_channel, 'type': values['macro'], 'start':values['params']['end'], 'end': values['params']['start']}
            else: dic = {'id': index_channel, 'type': values['macro'], 'start':values['params']['start'], 'end': values['params']['end']}
            if len_1 == 0: dic['direct'] = 0
            else: dic['direct'] = 1

            index_channel += 1
            positions.append(dic)

        print(dic)
        if values['macro'] == "AlignmentMarks_control" or values['macro'] == "AlignmentMarks":
            d['features'][k]['features'].pop(values)
    return positions

def input_json(input_path):
    file = open(input_path, "r")
    f = file.readline()
    d = json.loads(f)
    name = d['name']
    components = d['components']
    features = d['features']
    # new_dict = {'name':name, 'params':params, "components":components}

    print("/////////////////flow data/////////////////")
    flow_position = read_data(features, 0, ["Port", "Via", "Valve3D", "DiamondReactionChamber", "Pump3D"], d)
    # d = read_data(features, 0, ["Port", "Via"], d)
    print("/////////////////control data//////////////////")
    control_position= read_data(features, 1, ["Valve3D_control", "Port", "Pump3D_control"], d)
    file.close()
    return flow_position, control_position

def output_json(out_path, new_dict):
    f = open(out_path, "w")
    json.dump(new_dict,f)
    f.close()

flow_position, control_position = input_json("data/My-Device-V0.json")
output_json("data/My-Device-V0-flow.json", flow_position)
output_json("data/My-Device-V0-control.json", control_position)

