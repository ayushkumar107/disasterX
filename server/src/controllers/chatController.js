"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRooms = getRooms;
exports.getMessages = getMessages;
exports.sendMessage = sendMessage;
exports.seedDefaultRooms = seedDefaultRooms;

var _ChatRoom = require("../models/ChatRoom");
var _socketio = require("../config/socketio");
var _logger = require("../utils/logger");

const DEFAULT_ROOMS = [
  {
    name: 'Emergency Broadcast & Alerts',
    slug: 'emergency-broadcast',
    description: 'Official advisories, urgent hazard warnings, and emergency dispatches',
    type: 'GLOBAL'
  },
  {
    name: 'NER Landslide Intelligence',
    slug: 'ner-landslides',
    description: 'Ground reports, road blockages, and landslide telemetry across North Eastern Region',
    type: 'DISASTER'
  },
  {
    name: 'Rescue Teams & Volunteers',
    slug: 'rescue-dispatch',
    description: 'First responders, evacuation coordination, and volunteer task force',
    type: 'RESCUE'
  },
  {
    name: 'Community Mutual Aid',
    slug: 'community-aid',
    description: 'Public shelter requests, supplies, medical aid, and citizen assistance',
    type: 'GLOBAL'
  }
];

async function seedDefaultRooms() {
  try {
    for (const r of DEFAULT_ROOMS) {
      const exists = await _ChatRoom.ChatRoom.findOne({ slug: r.slug });
      if (!exists) {
        const newRoom = await _ChatRoom.ChatRoom.create(r);
        // Add a welcoming system message
        await _ChatRoom.Message.create({
          chatRoom: newRoom._id,
          senderName: 'DISASTERLINK SYSTEM',
          senderRole: 'SYSTEM',
          type: 'SYSTEM',
          content: `Channel #${r.slug} initialized. Secure communication active.`
        });
      }
    }
    _logger.logger.info('✅ Chat rooms initialized');
  } catch (err) {
    _logger.logger.error('Failed to initialize default chat rooms:', err);
  }
}

async function getRooms(req, res) {
  try {
    let rooms = await _ChatRoom.ChatRoom.find({ isActive: true }).sort({ createdAt: 1 });
    if (rooms.length === 0) {
      await seedDefaultRooms();
      rooms = await _ChatRoom.ChatRoom.find({ isActive: true }).sort({ createdAt: 1 });
    }

    // Attach latest message snippet to each room
    const roomsWithLastMsg = await Promise.all(
      rooms.map(async (room) => {
        const lastMsg = await _ChatRoom.Message.findOne({ chatRoom: room._id })
          .sort({ createdAt: -1 })
          .select('content senderName senderRole createdAt type');
        return {
          ...room.toObject(),
          lastMessage: lastMsg || null
        };
      })
    );

    res.json({
      success: true,
      data: roomsWithLastMsg
    });
  } catch (error) {
    _logger.logger.error('Error fetching chat rooms:', error);
    res.status(500).json({ success: false, message: 'Server error fetching rooms' });
  }
}

async function getMessages(req, res) {
  try {
    const { roomId } = req.params;
    let room;
    if (roomId.match(/^[0-9a-fA-F]{24}$/)) {
      room = await _ChatRoom.ChatRoom.findById(roomId);
    } else {
      room = await _ChatRoom.ChatRoom.findOne({ slug: roomId });
    }

    if (!room) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    const messages = await _ChatRoom.Message.find({ chatRoom: room._id })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({
      success: true,
      data: {
        room,
        messages
      }
    });
  } catch (error) {
    _logger.logger.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Server error fetching messages' });
  }
}

async function sendMessage(req, res) {
  try {
    const { roomId } = req.params;
    const { content, senderName, senderRole, location, locationLabel, type } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    let room;
    if (roomId.match(/^[0-9a-fA-F]{24}$/)) {
      room = await _ChatRoom.ChatRoom.findById(roomId);
    } else {
      room = await _ChatRoom.ChatRoom.findOne({ slug: roomId });
    }

    if (!room) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    const messageData = {
      chatRoom: room._id,
      content: content.trim(),
      senderName: senderName || (req.user?.name) || 'Anonymous Responder',
      senderRole: senderRole || (req.user?.role) || 'CITIZEN',
      type: type || 'TEXT'
    };

    if (req.user?._id) {
      messageData.sender = req.user._id;
    }

    if (location && Array.isArray(location.coordinates)) {
      messageData.location = {
        type: 'Point',
        coordinates: location.coordinates
      };
      messageData.locationLabel = locationLabel || `${location.coordinates[1].toFixed(3)}°N, ${location.coordinates[0].toFixed(3)}°E`;
    }

    const message = await _ChatRoom.Message.create(messageData);

    // Broadcast via Socket.IO
    const io = (0, _socketio.getIO)();
    if (io) {
      const payload = {
        ...message.toObject(),
        roomSlug: room.slug
      };
      // Emit to specific room and also global ner-monitoring
      io.to(`chat:${room._id.toString()}`).emit('chat:message', payload);
      io.to(`chat:${room.slug}`).emit('chat:message', payload);
      io.to('ner-monitoring').emit('chat:new_message', payload);
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    _logger.logger.error('Error creating chat message:', error);
    res.status(500).json({ success: false, message: 'Server error sending message' });
  }
}
