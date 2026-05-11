// frontend/src/pages/ArtistProfile.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ArtistProfile = () => {
  const profileTag = useSelector(state => state.profile.tag);

  const [activity, setActivity] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [sector, setSector] = useState('');

  // Other existing code...

  return (
    <div>
      {/* Conditional rendering of the Sector field based on the profile tag */}
      {(profileTag === 'artist') && (
        <div>
          <label htmlFor=
