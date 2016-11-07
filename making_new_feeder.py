import json
feederNum = 1
feederName = 'feederATL' + str(feederNum)
feederName = 'feederATL1'

# root loc  "lat": 33.714380261152506,  "lng": -84.3741392665842, 
with open("public/" + feederName + "2.json", "r") as feedFile:
	pgObj = json.load(feedFile)
	newPgObj = {}
	# numsOfOld = len(pgObj.keys()) * feederNum
	# print numsOfOld
	# update pgindex + name
	for key in pgObj:
		# newkey = key + '1'
		oldEle = pgObj[key]
		newEle = oldEle.copy()
		# newKey = newEle['pgIndex']
		#update
		#if node, update location
		if 'lat' in newEle:
			# if (newEle['name'] == (1405848157)):
			if (newEle['name'] == ('150' + feederName)):
			# if (newEle['name'] == (1405848157)):
				print 'root node at same location'
			else:
				newEle['lat'] = newEle['lat'] + 0.02
				# newEle['lat'] = (33.714380261152506) + (newEle['lat'] - (33.714380261152506)) * .5
				# newEle['lat'] = newEle['lat'] + 0.08 - 0.01
				# newEle['lat'] = newEle['lat'] - (41.0487441 - 33.714380261152506)
		if 'lng' in newEle:
			if (newEle['name'] == ('150' + feederName)):
			# if (newEle['name'] == (1405848157)):
				print 'root node at same location'
			else:
				newEle['lng'] = newEle['lng']
				# newEle['lng'] = newEle['lng'] - (-71.9071658 - (-84.3741392665842))
				# newEle['lng'] = (-84.3741392665842) + (newEle['lng'] - (-84.3741392665842)) * .2
				# newEle['lng'] = (-84.3741392665842) - (newEle['lng'] - (-84.3741392665842)) * 1.1

		#final
		newPgObj[key] = newEle
with open("public/" + feederName + "2.json", "w") as outFile:
	json.dump(newPgObj, outFile, indent=4)