const { Trainer, Booking, TrainerMessage } = require("../models/Trainer");
const User = require("../models/user");

const getAllTrainers = async () => {
  try {
    const trainers = await Trainer.find().lean();
    // Check for duplicate _id values
    const idSet = new Set(trainers.map((t) => t._id.toString()));
    if (idSet.size !== trainers.length) {
      console.warn(
        "Duplicate trainer _id values detected:",
        trainers.map((t) => t._id)
      );
    }
    return trainers;
  } catch (error) {
    console.error("Error fetching trainers:", error);
    throw new Error("Failed to fetch trainers");
  }
};

const createTrainer = async (trainerData) => {
  try {
    const user = await User.findOne({ username: trainerData.username });
    if (!user) {
      throw new Error("User with provided username does not exist");
    }
    // Check for existing trainer with the same username
    const existingTrainer = await Trainer.findOne({
      username: trainerData.username,
    });
    if (existingTrainer) {
      throw new Error("Trainer with this username already exists");
    }
    trainerData.availability = Array.isArray(trainerData.availability)
      ? trainerData.availability
      : [];
    const trainer = new Trainer(trainerData);
    return await trainer.save();
  } catch (error) {
    console.error("Error creating trainer:", error);
    throw new Error("Failed to create trainer");
  }
};

const bookTrainer = async (username, trainerUsername, date, timeSlot) => {
  try {
    const trainer = await Trainer.findOne({ username: trainerUsername });
    if (!trainer) throw new Error("Trainer not found");
    const availability = trainer.availability.find(
      (avail) => avail.date.toISOString().split("T")[0] === date
    );
    if (!availability) throw new Error("No availability for selected date");
    const slot = availability.timeSlots.find(
      (slot) => slot.startTime === timeSlot && !slot.isBooked
    );
    if (!slot) throw new Error("Time slot not available");
    slot.isBooked = true;
    slot.bookedBy = username;
    await trainer.save();
    const booking = new Booking({
      username,
      trainerId: trainer._id,
      date: new Date(date),
      timeSlot,
      status: "pending",
    });
    return await booking.save();
  } catch (error) {
    console.error("Error booking trainer:", error);
    throw new Error("Failed to book trainer");
  }
};

const getUserBookings = async (username) => {
  try {
    return await Booking.find({ username })
      .populate("trainerId", "name specialty")
      .lean();
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw new Error("Failed to fetch bookings");
  }
};

const sendTrainerMessage = async (senderUsername, trainerUsername, content) => {
  try {
    const trainer = await Trainer.findOne({ username: trainerUsername });
    if (!trainer) throw new Error("Trainer not found");
    const message = new TrainerMessage({
      senderUsername,
      trainerUsername,
      content,
    });
    return await message.save();
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }
};

const getTrainerMessages = async (username, trainerUsername) => {
  try {
    const trainer = await Trainer.findOne({ username: trainerUsername });
    if (!trainer) throw new Error("Trainer not found");

    const messages = await TrainerMessage.find({
      $or: [
        { senderUsername: username, trainerUsername },
        { senderUsername: trainerUsername, trainerUsername: username },
      ],
    }).lean();

    // Ensure uniqueness by creating a Map with message IDs as keys
    const uniqueMessages = Array.from(
      new Map(messages.map((msg) => [msg._id.toString(), msg])).values()
    );

    return uniqueMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to fetch messages");
  }
};

const getTrainerByUsername = async (username) => {
  try {
    const trainer = await Trainer.findOne({ username });
    if (!trainer) throw new Error("Trainer not found");
    return trainer;
  } catch (error) {
    console.error("Error fetching trainer:", error);
    throw new Error("Failed to fetch trainer");
  }
};

module.exports = {
  getAllTrainers,
  createTrainer,
  bookTrainer,
  getUserBookings,
  sendTrainerMessage,
  getTrainerMessages,
  getTrainerByUsername,
};
