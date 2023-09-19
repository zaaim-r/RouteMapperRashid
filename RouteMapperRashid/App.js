/* 
Welcome to my App RouteMapperRashid! This app begins by asking for your permission to access your location. Once permission is granted, the app will open with a MapView and
a large Start button. Once this button is pressed, the map zooms in on the user's location and will begin to track the route the user takes, using PolyLines to trace this
route. Only when the user "travels" at least 30 meters will the app draw a line. Once the user has finished their run, they can press the "End Route" button, which will
bring up a Modal that displays a MapView with the entire route and the total distance traveled. The "extra feature" that my app has is that it is tracking the user's location
in real time, instead of making the user trace their own route. There is also a "Continue" button which, when pressed, will allow the user to start a new run and resets all
previous variables. 

The limitations to my app include the following:
  - Travels is in quotations because sometimes the location will spazz out and accidentally move enough to make the app think a route has been ran, an issue I tried diligiently 
    to fix, but to no avail. 
  - Sizing issues might differ depending on your device, as I was unable to test my app on different devices.

with these two exceptions, have fun with tracking the runs you complete!
*/

import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState, Component, useRef} from 'react';
import { StyleSheet, Moment, Vibration, Animated, Platform, Modal, View, Text, Button, TextInput, TouchableOpacity, SafeAreaView, Image, ImageBackground, Dimensions, Switch, Alert, ViewPagerAndroidComponent, Systrace, ScrollView, Touchable, FlatList, LogBox} from 'react-native';
import MapView, {Polyline} from 'react-native-maps';
import { Marker } from 'react-native-maps';

export default function App() {
  let _map = useRef(null);
  const [currentLocation, setCurrentLocation] = useState({latitude: 0, longitude: 0, latitudeDelta: 0.06, longitudeDelta: 0.06});
  const [locations, addLocations] = useState([]);
  const [route, setShowRoute] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [running, startRunning] = useState(false);
  
  useEffect(()=>{
    let temp = 0;
    if (running == true){
      if (locations.length == 0){
        addLocations([currentLocation])
      }
      else {
        temp = findDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          locations[locations.length - 1].latitude,
          locations[locations.length - 1].longitude,
          );
      }
      if (temp > 30){
        addLocations([...locations, currentLocation])
        setTotalDistance(temp + totalDistance)
      }
    console.log(locations);
    console.log(temp);
    }
  },[currentLocation])
  
  function changeUserCoords(c){ 
    setCurrentLocation(c.nativeEvent.coordinate)
  }
  function start(){
    startRunning(true);
  }
  function finish(){
    startRunning(false);
    setShowRoute(true);
    _map.current.fitToCoordinates(locations);
  }
  function newRun(){
    addLocations([]);
    setShowRoute(false);
    setTotalDistance(0);
    startRunning(false);
    setCurrentLocation({latitude: 0, longitude: 0, latitudeDelta: 0.06, longitudeDelta: 0.06});
    _map.current.fitToCoordinates(locations);
  }
  function findDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1); // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return Math.round(d * 1000);
  }
  function findMidpoint(lat1, lon1, lat2, lon2){
    const Bx = Math.cos(lat2) * Math.cos(lon2-lon1)
    const By = Math.cos(lat2) * Math.sin(lon2-lon1);
    const lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt( (Math.cos(lat1)+Bx)*(Math.cos(lat1)+Bx) + By*By ) );
    const lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx)
    setMidpoint({
      latitude: rad2deg(lat3),
      longitude: rad2deg(lon3),
    })
  }
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }
  function rad2deg(rad){
    return rad * (180/Math.PI)
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto"/>
      <View style={styles.rowMap}>
        <MapView
          ref = {_map}
          style={styles.map}
          userInterfaceStyle='dark'
          showsUserLocation={running}
          followsUserLocation={running}
          onUserLocationChange={(c) => changeUserCoords(c)}
        >
          <Polyline
            coordinates={locations}
            strokeColor="black"
            strokeColors={[
              'black',
            ]}
            strokeWidth={2}
          />
        </MapView>
        { running == false ? 
          <TouchableOpacity 
          style={styles.startRouteButton}
          onPress={() => start()}
        >
          <Text style={{ ...styles.endRouteText, ...{ fontFamily: 'HoeflerText-Regular' } }}>Start!</Text>
        </TouchableOpacity>
        :
          <TouchableOpacity 
          style={styles.endRouteButton}
          onPress={() => finish()}
        >
          <Text style={{ ...styles.endRouteText, ...{ fontFamily: 'HoeflerText-Regular' } }}>End Route</Text>
        </TouchableOpacity>
        }
      </View>
      <Modal
        animationType='slide'
        visible={route}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.rowSummary}>
            <Text style={{ ...styles.guessText, ...{ fontFamily: 'HoeflerText-Regular' } }}>Run Summary</Text>
          </View>
          <View style={styles.rowMap2}>
            <MapView
            ref={_map}
            style={styles.mapModal}
            userInterfaceStyle='dark'
            region={{latitude: currentLocation.latitude, longitude: currentLocation.longitude, latitudeDelta: 0.0007, longitudeDelta: 0.0007}}
            >
              { locations.length > 0 && route &&
                <Marker
                coordinate={{
                  latitude: locations[0].latitude,
                  longitude: locations[0].longitude,
                  }}
                  pinColor='green'
                  title = "Start"
                />
              }
              { locations.length > 0 && route &&
                <Polyline
                  coordinates={locations}
                  strokeColor="black"
                  strokeColors={[
                    'black',
                  ]}
                  strokeWidth={2}
                /> 
              }
              { locations.length > 0 && route &&
                  <Marker
                  coordinate={{
                    latitude: locations[locations.length - 1].latitude,
                    longitude: locations[locations.length - 1].longitude,
                    }}
                    pinColor='red'
                    title = "Finish"
                  />
              } 
            </MapView>
          </View>
          <View style={styles.rowRunDetails}>
            <Text style={styles.resultText}>Total Distance: {totalDistance} m</Text>
          </View>
          <View style={styles.rowRunAgain}>
            <TouchableOpacity
              style={styles.guessButton}
              onPress={() => newRun()}
            >
              <Text style={{ ...styles.guessText, ...{ fontFamily: 'HoeflerText-Regular' } }}>New Run</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(95, 143, 245)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapModal: {
    width: Dimensions.get('window').width - 10,
    height: "100%",
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 5,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  rowMap: {
    flexDirection: "row",
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  rowMap2: {
    flexDirection: "row",
    width: Dimensions.get('window').width,
    height: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  rowButton1: {
    flexDirection: "row",
    width: Dimensions.get('window').width,
    height: "17%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'red',
    padding: 5,
  },
  rowButton2: {
    flexDirection: "row",
    width: Dimensions.get('window').width,
    height: "17%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'yellow',
    padding: 5,
  },
  rowResult: {
    flexDirection: "row",
    width: Dimensions.get('window').width,
    height: "25%",
    justifyContent: "center",
    alignItems: "center",
  },
  endRouteButtonRow: {
    flexDirection: "row",
    width: Dimensions.get('window').width,
    height: "25%",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 625,
  },
  rowSummary: {
    flexDirection: "row",
    width: Dimensions.get('window').width,
    height: "16.6%",
    justifyContent: "center",
    alignItems: "center",
  },
  rowRunDetails: {
    flexDirection: "row",
    width: Dimensions.get('window').width,
    height: "6%",
    justifyContent: "center",
    alignItems: "center",
  },
  rowRunAgain: {
    flexDirection: "row",
    width: Dimensions.get('window').width,
    height: "16.6%",
    justifyContent: "center",
    alignItems: "center",
  },
  guessButton: {
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: "white"
  },
  guessText: {
    textAlign: "center",
    color: "black",
    fontSize: 60,
  },
  startRouteButton: {
    borderWidth: 3,
    borderRadius: 75,
    backgroundColor: "green",
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    height: 150,
    justifyContent: "center",
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffset: { height: 1, width: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    position: 'absolute',
    alignSelf:'flex-end'
    //opacity: 0.75,
  },
  endRouteButton: {
    borderWidth: 3,
    borderRadius: 75,
    backgroundColor: "red",
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    height: 150,
    justifyContent: "center",
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffset: { height: 1, width: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    position: 'absolute',
    alignSelf:'flex-end'
    //opacity: 0.75,
  },
  endRouteText: {
    textAlign: "center",
    color: "black",
    fontSize: 60,
  },
  resultText: {
    textAlign: "center",
    color: "black",
    fontSize: 30,
  },
});