import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createFeedback } from '../../actions/feedback';
import { TextField, Button, Typography, Container, Grid, Paper, Rating } from '@mui/material';

const FeedbackForm = ({ createFeedback, history, match }) => {
  // Assuming the donation/request ID might come from URL params if feedback is specific
  // For generic feedback, this might not be needed or could be optional
  const relatedId = match && match.params && match.params.id; 

  const [formData, setFormData] = useState({
    rating: 3, // Default rating
    comment: '',
    feedbackType: relatedId ? 'Transaction' : 'General' // Example logic
  });

  const { rating, comment, feedbackType } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const onRatingChange = (event, newValue) => {
    setFormData({ ...formData, rating: newValue });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!comment) {
      // Consider using the alert action here
      console.error('Comment is required for feedback');
      return;
    }
    const feedbackData = {
      ...formData,
      relatedDonation: feedbackType === 'Transaction' && relatedId ? relatedId : undefined,
      // relatedRequest: feedbackType === 'Transaction' && relatedId ? relatedId : undefined, // if feedback can be for requests too
    };
    createFeedback(feedbackData, history);
  };

  return (
    <Container component={Paper} sx={{ mt: 4, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Submit Feedback
      </Typography>
      <form onSubmit={onSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography component="legend">Rating</Typography>
            <Rating
              name="rating"
              value={rating}
              onChange={onRatingChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="comment"
              variant="outlined"
              required
              fullWidth
              multiline
              rows={4}
              label="Your Feedback/Comment"
              value={comment}
              onChange={onChange}
            />
          </Grid>
           {/* Optional: Field for feedback type if not derived 
           <Grid item xs={12} sm={6}>
            <TextField
              name="feedbackType"
              variant="outlined"
              required
              fullWidth
              label="Feedback Type (e.g., General, Transaction)"
              value={feedbackType}
              onChange={onChange}
            />
          </Grid>
          */}
          {relatedId && (
            <Grid item xs={12}>
              <Typography variant="caption">
                Feedback related to transaction ID: {relatedId}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button type="submit" fullWidth variant="contained" color="primary">
              Submit Feedback
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

FeedbackForm.propTypes = {
  createFeedback: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.object // If using react-router and expecting params
};

export default connect(null, { createFeedback })(FeedbackForm);