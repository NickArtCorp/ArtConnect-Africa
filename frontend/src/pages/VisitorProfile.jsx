// frontend/src/pages/VisitorProfile.jsx
import React, { useState } from 'react';
// Import only the necessary hooks from react-redux. The previous import duplicated
// `useSelector`, which caused a TypeScript duplicate identifier error and
// produced an unused variable warning. The corrected import removes the
// duplicate and keeps the code clean.
import { useDispatch, useSelector } from 'react-redux';
import { handleSubmit } from '../store';

const VisitorProfile = () => {
  const [activity, setActivity] = useState('');
  const [specialty, setSpecialty] = useState('');
  // Local state for the optional sector field. It is only rendered when the
  // profile tag indicates an artist.
  const [sector, setSector] = useState('');
  const dispatch = useDispatch();
  // Retrieve the profile tag from the Redux store. This determines whether the
  // sector field should be displayed.
  const profileTag = useSelector((state) => state.profileTag);

  const onSubmit = (event) => {
    event.preventDefault();
  const formData = {
    activity,
    specialty,
    // Include sector only when the profile tag indicates an artist.
    ...(profileTag === 'artist' && { sector })
  };
    dispatch(handleSubmit(formData));
  };

  return (
    <form onSubmit={onSubmit}>
      {/* Existing form fields */}
      <label htmlFor="activity">Activity:</label>
      <input id="activity" type="text" value={activity} onChange={(e) => setActivity(e.target.value)} />

      <label htmlFor="specialty">Specialty:</label>
      <input id="specialty" type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />

      {/* Conditional rendering of the Sector field based on the profile tag */}
      {(profileTag === 'artist') && (
        <div>
          <label htmlFor="sector">Sector:</label>
          <input id="sector" type="text" value={sector} onChange={(e) => setSector(e.target.value)} />
        </div>
      )}

      {/* Other existing form fields */}
      <button type="submit">Submit</button>
    </form>
  );
};

export default VisitorProfile;
