/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ActivityIndicator,
  FlatList,
  TextInput,
  Platform,
  Image,
} from 'react-native';

import {Activity, LikeButton, UserBar} from 'react-native-activity-feed';
import {TouchableOpacity} from 'react-native-gesture-handler';
import axios from 'axios';
import {launchImageLibrary} from 'react-native-image-picker';

/* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
 * LTI update could not be added via codemod */

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState([]);
  const [post, setPost] = useState();
  const [image, setImage] = useState();

  const fetchUserToken = async () => {
    const res = await fetch('http://localhost:3000');
    const userData = await res.json();
    return userData;
  };
  const fetchTimeline = async () => {
    const res = await fetch('http://localhost:3000/getTimeline');
    const data = await res.json();
    return data;
  };

  useEffect(() => {
    fetchUserToken().then(res => {
      setUserToken(res.userToken);
      setLoading(false);
    });
    fetchTimeline().then(res => {
      setFeed(res?.results);
    });
  }, []);

  const renderHeader = props => {
    const {activity} = props;
    const {actor} = activity;
    return (
      <View style={{marginLeft: 10}}>
        <UserBar
          username={actor?.data?.name || 'Unknown User'}
          avatar={actor?.data?.profileImage}
        />
      </View>
    );
  };

  const renderActivity2 = props => {
    return (
      <Activity
        Header={renderHeader(props)}
        {...props}
        Footer={<LikeButton {...props} />}
      />
    );
  };

  const renderActivity = ({item}) => {
    return (
      <View
        style={{
          backgroundColor: '#F8F8F8',
          padding: 10,
          borderRadius: 5,
          margin: 5,
        }}
      >
        <Text style={{}}>{item?.object}</Text>
        {item?.image && (
          <View style={{alignItems: 'center', padding: 10}}>
            <Image
              style={{width: 300, height: 200}}
              source={{uri: item?.image}}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
    );
  };

  const handleNewPost = async () => {
    if (post && post != '') {
      setLoading(true);
      const result = await axios.post('http://localhost:3000/activity', {
        actor: 'testUser1',
        verb: 'add',
        object: post,
        image,
      });

      result?.status == 200 &&
        fetchTimeline().then(res => {
          setFeed(res?.results);
          setLoading(false);
          setPost(undefined);
          setImage(undefined);
        });
    }
  };

  const handleImage = async () => {
    const {assets} = await launchImageLibrary({});
    const uri = assets[0]?.uri;

    setImage(Platform.OS === 'ios' ? uri.replace('file://', '') : uri);
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <>
        <>
          {loading && <ActivityIndicator />}
          {feed?.length > 0 ? (
            <FlatList data={feed} renderItem={item => renderActivity(item)} />
          ) : (
            <View
              style={{
                flex: 1,
                padding: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>No data available.</Text>
            </View>
          )}
        </>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 5,
          }}
        >
          <View style={{flex: 1}}>
            <TextInput
              style={styles.inputWrap}
              placeholder={'Type your post...'}
              onChangeText={val => setPost(val)}
              value={post}
            />
          </View>
          {image ? (
            <Image
              style={{width: 30, height: 50}}
              source={{uri: image}}
              resizeMode="contain"
            />
          ) : (
            <TouchableOpacity style={styles.btn} onPress={handleImage}>
              <Text style={{color: '#FFFFFF', fontWeight: '600'}}>Upload</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btn} onPress={handleNewPost}>
            <Text style={{color: '#FFFFFF', fontWeight: '600'}}>Post</Text>
          </TouchableOpacity>
        </View>
      </>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  btn: {
    margin: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#369AFE',
    borderRadius: 5,
  },
  inputWrap: {
    backgroundColor: '#F8F8F8',
    margin: 10,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
});

export default App;
