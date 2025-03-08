import React, {useState, useRef, useEffect} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  ImageBackground,
  Image,
  Alert,
} from 'react-native';

const SQUARE_SIZE = 60;
const TARGET_SIZE = 100;
const {width, height} = Dimensions.get('window');

export default function App() {
  const [score, setScore] = useState(0);
  const [color, setColor] = useState('red');
  const [timer, setTimer] = useState(5); // Timer state
  const [gameOver, setGameOver] = useState(false);
  const [moved, setMoved] = useState(false); //] Game status state

  const pan = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const playerPan = useRef(new Animated.ValueXY({x: 200, y: 550})).current;

  // Create a new colored square at a random position along the edge
  const spawnNewSquare = () => {
    const side = Math.floor(Math.random() * 4);
    let startX = 0,
      startY = 860;

    switch (side) {
      case 0: // top
        startX = Math.random() * (width - SQUARE_SIZE);
        startY = 0;
        break;
      case 1: // right
        startX = width - SQUARE_SIZE;
        startY = Math.random() * (height - SQUARE_SIZE);
        break;
      case 2: // bottom
        startX = Math.random() * (width - SQUARE_SIZE);
        startY = height - SQUARE_SIZE;
        break;
      case 3: // left
        startX = 0;
        startY = Math.random() * (height - SQUARE_SIZE);
        break;
    }

    // Random color
    const Color = 'orange';

    setColor(Color);

    // Set the Animated.ValueXY to this new position
    pan.setValue({x: startX, y: startY});
  };

  // Initialize the first square
  // Initialize the first square
  useEffect(() => {
    spawnNewSquare();
  }, []);

  // Timer effect
  useEffect(() => {
    if (timer === 0) {
      resetGame(); // Reset the game state when timer hits 0
    } else {
      const interval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer > 0) {
            console.log(prevTimer - 1);
            return prevTimer - 1;
          } else {
            clearInterval(interval);
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  const resetGame = () => {
    setScore(0);
    setTimer(30);
  };

  const isOverTarget = () => {
    const squareX = pan.x.__getValue();
    const squareY = pan.y.__getValue();

    const targetX = width / 2 - TARGET_SIZE / 2;
    const targetY = 0;

    return (
      squareX < targetX + TARGET_SIZE &&
      squareX + SQUARE_SIZE > targetX &&
      squareY < targetY + TARGET_SIZE &&
      squareY + SQUARE_SIZE > targetY
    );
  };
  const isOverPlayer = () => {
    const squareX = pan.x.__getValue();
    const squareY = pan.y.__getValue();
    let playerX = playerPan.x.__getValue();
    let playerY = playerPan.y.__getValue();
    return (
      squareX < playerX + SQUARE_SIZE &&
      squareX + SQUARE_SIZE > playerX &&
      squareY < playerY + SQUARE_SIZE &&
      squareY + SQUARE_SIZE > playerY
    );
  };

  // Set up the PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x.__getValue(),
          y: pan.y.__getValue(),
        });
        pan.setValue({x: 0, y: 0});
      },
      onPanResponderMove: (e, gestureState) => {
        pan.x.setValue(gestureState.dx);
        pan.y.setValue(gestureState.dy);
        if (isOverPlayer()) {
          setScore(prev => prev - 1);
        }
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        if (isOverTarget()) {
          setScore(prev => prev + 1);
          Animated.spring(pan, {toValue: {x: 0, y: 860}, useNativeDriver: false}).start();
        } else if (isOverPlayer()) {
          setScore(prev => prev - 1);
          Animated.spring(pan, {toValue: {x: 0, y: 860}, useNativeDriver: false}).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(playerPan, {
          toValue: {x: 50, y: 100},
          duration: 1750,
          useNativeDriver: false,
        }),
        Animated.timing(playerPan, {
          toValue: {x: 300, y: 100},
          duration: 1750,
          useNativeDriver: false,
        }),
        Animated.timing(playerPan, {
          toValue: {x: 300, y: 500},
          duration: 1750,
          useNativeDriver: false,
        }),
        Animated.timing(playerPan, {
          toValue: {x: 50, y: 100},
          duration: 1750,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={require('./assets/basketball.png')} style={styles.backgroundImage}>
        <View style={styles.gameContainer}>
          <Text style={styles.scoreText}>Score: {score}</Text>
          <Text style={styles.timerText}>Time: {timer}s</Text> {/* Display the timer */}
          {/* Target Square (Gray) */}
          <View style={styles.targetSquare} />
          {/* Draggable Square (Image) */}
          <Animated.View
            style={[
              styles.draggableSquare,
              {
                transform: [{translateX: pan.x}, {translateY: pan.y}],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Image source={require('./assets/basketball-ball.png')} style={styles.draggableImage} />
          </Animated.View>
          <Animated.View
            style={[
              styles.player,
              {
                transform: [{translateX: playerPan.x}, {translateY: playerPan.y}],
              },
            ]}
          >
            <Image source={require('./assets/basketball-player.png')} style={styles.playerImage} />
          </Animated.View>
          <Text style={styles.instructions}>Drag the ball to the basket</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  gameContainer: {
    flex: 1,
    position: 'relative',
  },
  targetSquare: {
    position: 'absolute',
    width: TARGET_SIZE * 1.5,
    height: (TARGET_SIZE * 1.5) / 2,
    backgroundColor: 'transparent',
    top: 0,
    left: '50%',
    marginLeft: -(TARGET_SIZE * 1.5) / 2,
    borderRadius: (TARGET_SIZE * 1.5) / 2,
  },
  draggableSquare: {
    position: 'absolute',
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
  },
  draggableImage: {
    width: '100%',
    height: '100%',
    borderRadius: SQUARE_SIZE / 2,
  },
  scoreText: {
    position: 'absolute',
    top: 40,
    left: 20,
    fontSize: 24,
    fontWeight: 'bold',
  },
  timerText: {
    position: 'absolute',
    top: 40,
    right: 20,
    fontSize: 24,
    fontWeight: 'bold',
  },
  instructions: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  gameOverText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -width / 2}, {translateY: -20}],
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  player: {
    position: 'absolute',
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
  },
  playerImage: {
    width: '100%',
    height: '100%',
    borderRadius: SQUARE_SIZE / 2,
  },
});
