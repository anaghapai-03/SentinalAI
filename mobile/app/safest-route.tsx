import { View, StyleSheet, Text, Pressable } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useState } from 'react';
import axios from 'axios';

export default function SafestRoute() {
  const [start, setStart] = useState<any>(null);
  const [end, setEnd] = useState<any>(null);

  const [safest, setSafest] = useState<any[]>([]);
  const [shortest, setShortest] = useState<any[]>([]);
  const [mode, setMode] = useState<'safest' | 'shortest'>('safest');

  const handleMapPress = (e: any) => {
    const coord = e.nativeEvent.coordinate;

    if (!start) {
      setStart(coord);
    } else if (!end) {
      setEnd(coord);
    } else {
      // reset if both selected
      setStart(coord);
      setEnd(null);
      setSafest([]);
      setShortest([]);
    }
  };

  const getRoutes = async () => {
    if (!start || !end) return;

    try {
      const res = await axios.post('http://10.80.10.25:5000/api/route/suggest', {
        start: [start.longitude, start.latitude],
        end: [end.longitude, end.latitude],
      });

      const safestCoords = res.data.safest.coords.map((c: any) => ({
        latitude: c[1],
        longitude: c[0],
      }));

      const shortestCoords = res.data.shortest.coords.map((c: any) => ({
        latitude: c[1],
        longitude: c[0],
      }));

      setSafest(safestCoords);
      setShortest(shortestCoords);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>

      <MapView
        style={styles.map}
        onPress={handleMapPress}
        initialRegion={{
          latitude: 12.9716,
          longitude: 77.5946,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >

        {start && <Marker coordinate={start} title="Start" pinColor="green" />}
        {end && <Marker coordinate={end} title="End" pinColor="red" />}

        {mode === 'safest' && safest.length > 0 && (
          <Polyline coordinates={safest} strokeWidth={5} strokeColor="green" />
        )}

        {mode === 'shortest' && shortest.length > 0 && (
          <Polyline coordinates={shortest} strokeWidth={5} strokeColor="blue" />
        )}

      </MapView>

      {/* Controls */}
      <View style={styles.controls}>

        <Pressable style={styles.button} onPress={getRoutes}>
          <Text style={styles.text}>GET ROUTES</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => setMode('safest')}>
          <Text style={styles.text}>SAFE</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => setMode('shortest')}>
          <Text style={styles.text}>SHORT</Text>
        </Pressable>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  map: { flex: 1 },

  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },

  button: {
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 10,
  },

  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});