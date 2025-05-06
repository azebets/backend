const User = require('../models/user.model');

const updateUserDetails = async (req, res) => {
  const { firstName, lastName, country, place, dateOfBirth, residentAddress, city, postalCode } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.country = country;
    user.place = place;
    user.dateOfBirth = dateOfBirth;
    user.residentAddress = residentAddress;
    user.city = city;
    user.postalCode = postalCode;

    await user.save();
    res.status(200).json({ message: 'User details updated successfully' });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { updateUserDetails }