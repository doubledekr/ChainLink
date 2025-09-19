# 🎮 Real Multiplayer Setup for ChainLink

## Quick Setup for 2 Phones

### 1. **Install Server Dependencies**
```bash
# In your ChainLinkGame directory
cp server-package.json package-server.json
npm install express socket.io cors --save-dev
```

### 2. **Find Your Computer's IP Address**

**On Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

**Look for something like:** `192.168.1.100` or `10.0.0.5`

### 3. **Update the Server URL**

Edit `MultiplayerManager.js` line 179:
```javascript
const serverUrl = 'http://YOUR_IP_ADDRESS:3001'; // Replace with your actual IP
```

### 4. **Start the Multiplayer Server**
```bash
node server.js
```

You should see:
```
🚀 ChainLink Multiplayer Server running on port 3001
📱 Connect your Expo apps to this server!
```

### 5. **Connect Both Phones**

1. **Phone 1**: Open Expo Go → Scan QR code → Tap "⚡ Multiplayer Battle"
2. **Phone 2**: Open Expo Go → Scan QR code → Tap "⚡ Multiplayer Battle"
3. **Both phones**: Tap "🎯 Quick Match"

### 6. **Real Multiplayer Gameplay**

- **Matchmaking**: Server pairs the two players automatically
- **Real-time**: Moves are sent instantly between phones
- **Round System**: 5 rounds, first correct answer wins each round
- **Live Updates**: See opponent's progress in real-time

## 🔧 **Troubleshooting**

### **"Connection Error"**
- Make sure both phones are on the same WiFi network
- Check that your computer's firewall allows port 3001
- Verify the IP address is correct in MultiplayerManager.js

### **"No Match Found"**
- Make sure the server is running (`node server.js`)
- Both phones need to be connected to the server
- Check console logs for connection status

### **"Opponent Disconnected"**
- Normal if one player closes the app
- Server automatically cleans up the match

## 🎯 **Server Features**

- **Real-time Communication**: Instant move synchronization
- **Automatic Matchmaking**: Pairs players automatically
- **Round Management**: Handles 5-round tournament system
- **Disconnect Handling**: Graceful cleanup when players leave
- **Score Tracking**: Real-time score updates

## 🚀 **Ready to Play!**

Once set up, you'll have true real-time multiplayer where:
- Both players see the same puzzle
- First correct answer wins the round
- Moves are synchronized instantly
- Falling tile animations on round transitions
- Real competition between phones!

Perfect for testing with friends or family! 🔥
