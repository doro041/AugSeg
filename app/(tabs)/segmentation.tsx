import React, { useState, useRef } from 'react';
import { Button, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import {
    CameraMode,
    CameraType,
    CameraView,
    useCameraPermissions,
} from "expo-camera";
import { Image } from "expo-image";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';

export default function SegmentationScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const ref = useRef<CameraView>(null);
    const [uri, setUri] = useState<string | null>(null);
    const [mode, setMode] = useState<CameraMode>("picture");
    const [facing, setFacing] = useState<CameraType>("back");
    const [recording, setRecording] = useState(false);
    const [screenState, setScreenState] = useState<'landing' | 'camera' | 'preview'>('landing');

    if (!permission && screenState === 'camera') {
        return null;
    }

    if (permission && !permission.granted && screenState === 'camera') {
        return (
            <View style={styles.container}>
                <Text style={styles.headerText}>Camera Permission Required</Text>
                <Text style={styles.descriptionText}>
                    We need your permission to use the camera
                </Text>
                <View style={styles.buttonContainer}>
                    <Button onPress={requestPermission} title="Grant permission" />
                    <Button onPress={() => setScreenState('landing')} title="Go back" color="#888" />
                </View>
            </View>
        );
    }

    const recordVideo = async () => {
        if (recording) {
            setRecording(false);
            ref.current?.stopRecording();
            return;
        }
        setRecording(true);
        const video = await ref.current?.recordAsync();
        console.log({ video });
    };

    const toggleMode = () => {
        setMode((prev) => (prev === "picture" ? "video" : "picture"));
    };

    const toggleFacing = () => {
        setFacing((prev) => (prev === "back" ? "front" : "back"));
    };

    const takePicture = async () => {
        const photo = await ref.current?.takePictureAsync();
        console.log(photo);
        if (photo && photo.uri) {
            setUri(photo.uri);
            setScreenState('preview');
        } else {
            console.error("Failed to take a picture", photo);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setUri(result.assets[0].uri);
            setScreenState('preview');
        } else {
            Alert.alert('You did not select any image.');
        }
    };

    const openCamera = async () => {
        if (!permission) {
            const permissionResult = await requestPermission();
            if (!permissionResult.granted) {
                Alert.alert('Permission Denied', 'Camera permission is required to use this feature.');
                return;
            }
        }
        setScreenState('camera');
    };

    const renderLandingScreen = () => {
        return (
            <View style={styles.landingContainer}>
                <Text style={styles.headerText}>Image Segmentation</Text>
                <Text style={styles.descriptionText}>
                    Take a photo or select an image from your gallery to begin.
                </Text>
                
                <View style={styles.landingButtonsContainer}>
                    <View style={styles.buttonWrapper}>
                        <Pressable 
                            style={({pressed}) => [
                                styles.landingButton,
                                {opacity: pressed ? 0.8 : 1}
                            ]}
                            onPress={openCamera}
                        >
                            <FontAwesome6 name="camera" size={40} color="#3498db" />
                            <Text style={styles.buttonText}>Open Camera</Text>
                        </Pressable>
                    </View>
                    
                    <View style={styles.buttonWrapper}>
                        <Pressable 
                            style={({pressed}) => [
                                styles.landingButton,
                                {opacity: pressed ? 0.8 : 1}
                            ]}
                            onPress={pickImage}
                        >
                            <FontAwesome6 name="file-image" size={40} color="#f39c12" />
                            <Text style={styles.buttonText}>Upload Image</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    };

    const renderCamera = () => {
        return (
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    ref={ref}
                    mode={mode}
                    facing={facing}
                    mute={false}
                    responsiveOrientationWhenOrientationLocked
                />
                
                <View style={styles.controlsContainer}>
                    <View style={styles.buttonRow}>
                        <Button 
                            title={mode === "picture" ? "Take Picture" : (recording ? "Stop Recording" : "Start Recording")}
                            onPress={mode === "picture" ? takePicture : recordVideo}
                            color={mode === "picture" ? "#2ecc71" : "#e74c3c"}
                        />
                    </View>
                    
                    <View style={styles.buttonRow}>
                        <Button 
                            title={`Switch Camera`}
                            onPress={toggleFacing}
                            color="#9b59b6"
                        />
                        
                        <Button 
                            title={mode === "picture" ? "Switch to Video" : "Switch to Photo"} 
                            onPress={toggleMode}
                            color="#3498db"
                        />
                        
                        <Button 
                            title="Back" 
                            onPress={() => setScreenState('landing')}
                            color="#7f8c8d"
                        />
                    </View>
                </View>
            </View>
        );
    };

    const renderPreview = () => {
        return (
            <View style={styles.previewContainer}>
                <Text style={styles.headerText}>Image Preview</Text>
                
                <Image
                    source={{ uri }}
                    contentFit="contain"
                    style={styles.previewImage}
                />
                
                <View style={styles.buttonContainer}>
                    <Button 
                        title="Process Image" 
                        onPress={() => Alert.alert('Processing', 'Image segmentation would start here.')}
                        color="#2ecc71" 
                    />
                    <Button 
                        title="Take Another" 
                        onPress={() => setScreenState('landing')}
                        color="#3498db" 
                    />
                </View>
            </View>
        );
    };

    // Determine which screen to show
    let content;
    switch (screenState) {
        case 'landing':
            content = renderLandingScreen();
            break;
        case 'camera':
            content = renderCamera();
            break;
        case 'preview':
            content = renderPreview();
            break;
    }

    return (
        <View style={styles.container}>
            {content}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    landingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        width: "100%",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    descriptionText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 32,
        color: "#666",
    },
    landingButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginTop: 20,
    },
    buttonWrapper: {
        width: "45%",
    },
    landingButton: {
        backgroundColor: "#f8f9fa",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        height: 150,
    },
    buttonText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    cameraContainer: {
        flex: 1,
        width: "100%",
        position: "relative",
    },
    camera: {
        flex: 1,
        width: "100%",
    },
    controlsContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 15,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 8,
    },
    previewContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    previewImage: {
        width: 300, 
        height: 300,
        marginVertical: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginTop: 20,
    },
});