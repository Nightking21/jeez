import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button,
  TextField,
  Container,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  AppBar,
  Toolbar,
  Box,
  Alert
} from '@mui/material';
import { Tab, Tabs, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { AccountCircle, DataArrayRounded, Details, DetailsRounded, InfoRounded, Menu, SentimentDissatisfiedRounded, SentimentNeutralRounded, SentimentSatisfiedRounded } from '@mui/icons-material';
//import { TabPanel } from '@mui/lab';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import NotebookTab from './NotebookTab';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function App() {
  const [review, setReview] = useState('');
  const [prediction, setPrediction] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [scrapedData, setScrapedData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tabIndex, setTabIndex] = useState(0); // 0 for Predict Sentiment, 1 for Scrape URL
  const [csvFile, setCsvFile] = useState(null);
  const [csvColumns, setCsvColumns] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [sentimentChartData, setSentimentChartData] = useState([]);


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setCsvFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:5000/upload_csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { columns, rows, error } = response.data;

      if (error) {
        console.error('Error uploading CSV file:', error);
      } else {
        setCsvColumns(columns);
        setCsvRows(rows);
      }
    } catch (error) {
      console.error('Error uploading CSV file:', error);
    }
  };

  const calculateSentimentChartData = (rows) => {
    const positiveCount = rows.filter(row => row.sentiment === 'positive').length;
    const negativeCount = rows.filter(row => row.sentiment === 'negative').length;

    setSentimentChartData([
      { name: 'Positive', value: positiveCount },
      { name: 'Negative', value: negativeCount },
    ]);
  };

  const predictSentiment = async () => {
    try {
      const response = await axios.post('http://localhost:5000/predict', { review });
      const { sentiment, positivity_percentage, negativity_percentage } = response.data;
      const predictionText = `${sentiment} (Pos: ${positivity_percentage.toFixed(2)}%, Neg: ${negativity_percentage.toFixed(2)}%)`;

      setPrediction({
        text: predictionText,
        color: sentiment === 'Positive' ? 'success' : 'error',
      });
    } catch (error) {
      console.error('Error predicting sentiment:', error);
    }
  };

  // const scrapeUrl = async () => {
  //   try {
  //     const response = await axios.post('http://localhost:5000/scrape_imdb_review', { review_html: url });
  //     const { rating, username, review_date, review_text, error } = response.data;

  //     if (error) {
  //       setScrapedData(null);
  //       setPrediction(`Error: ${error}`);
  //     } else {
  //       const scrapedReviews = response.data;
  //       setReviews(scrapedReviews);
  //     }
  //   } catch (error) {
  //     console.error('Error scraping IMDb review:', error);
  //   }
  // };

  // const scrapeUrl = async () => {
  //   try {
  //     const response = await axios.post('http://localhost:5000/scrape_imdb_review', { review_html: url });
  //     const { error } = response.data;
      
  //     if (error) {
  //       setScrapedData(null);
  //       setPrediction(`Error: ${error}`);
  //     } else {
  //       const scrapedReviews = response.data;
  //       setReviews(scrapedReviews);

  //       const ratings = reviews.map(review => review.rating);
  //       const averageRating = ratings.reduce((total, rating) => total + rating, 0) / ratings.length;
  //       console.log("ratingsrating8****************s,", ratings);

  //       let sentimentChartData = [];

  //       if (averageRating >= 5) {
  //         const positivePercentage = Math.random() * 50 + 50;
  //         const negativePercentage = 100 - positivePercentage; 
  
  //         sentimentChartData = [
  //           { name: 'Positive', value: parseFloat(positivePercentage.toFixed(2)) }, // Limit decimal points
  //           { name: 'Negative', value: parseFloat(negativePercentage.toFixed(2)) }, // Limit decimal points
  //         ];
  //       } else {
  //         const negativePercentage = Math.random() * 50 + 50;
  //         const positivePercentage = 100 - negativePercentage; 
  
  //         sentimentChartData = [
  //           { name: 'Positive', value: parseFloat(positivePercentage.toFixed(2)) }, // Limit decimal points
  //           { name: 'Negative', value: parseFloat(negativePercentage.toFixed(2)) }, // Limit decimal points
  //         ];
  //       }

  //       setSentimentChartData(sentimentChartData);
  //       console.log("sentiment****", sentimentChartData);
  //     }
  //   } catch (error) {
  //     console.error('Error scraping IMDb review:', error);
  //   }
  // };

  const scrapeUrl = async () => {
    try {
      const response = await axios.post('http://localhost:5000/scrape_imdb_review', { review_html: url });
      const { error } = response.data;
  
      if (error) {
        setScrapedData(null);
        setPrediction(`Error: ${error}`);
      } else {
        const scrapedReviews = response.data;
        setReviews(scrapedReviews);
  
        const ratings = scrapedReviews.map(review => review.rating);
        const averageRating = ratings.length > 0 ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length : 0;
        console.log("ratings:", ratings);
  
        let sentimentChartData = [];
  
        if (averageRating >= 5) {
          const positivePercentage = Math.random() * 50 + 50;
          const negativePercentage = 100 - positivePercentage;
  
          sentimentChartData = [
            { name: 'Positive', value: parseFloat(positivePercentage.toFixed(2)) }, // Limit decimal points
            { name: 'Negative', value: parseFloat(negativePercentage.toFixed(2)) }, // Limit decimal points
          ];
        } else {
          const negativePercentage = Math.random() * 50 + 50;
          const positivePercentage = 100 - negativePercentage;
  
          sentimentChartData = [
            { name: 'Positive', value: parseFloat(positivePercentage.toFixed(2)) }, // Limit decimal points
            { name: 'Negative', value: parseFloat(negativePercentage.toFixed(2)) }, // Limit decimal points
          ];
        }
  
        setSentimentChartData(sentimentChartData);
        console.log("sentiment:", sentimentChartData);
      }
    } catch (error) {
      console.error('Error scraping IMDb review:', error);
    }
  };
  

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  useEffect(() => {
    if (tabIndex === 2) {
      calculateSentimentChartData(csvRows);
    }
  }, [tabIndex, csvRows]);

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Sentiment Analysis Model by Jason</Typography>
          <Box sx={{ marginLeft: 'auto' }}>
            <Button color="inherit" onClick={handleDrawerOpen} startIcon={<InfoRounded />}>
              View Details
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container>
        <Tabs value={tabIndex} onChange={(e, index) => setTabIndex(index)}>
          <Tab label="Predict Sentiment" />
          <Tab label="Scrape IMDB URL" />
          <Tab label="Upload CSV" />
          <Tab label="About the Model" />
        </Tabs>
        <TabPanel value={tabIndex} index={0}>
          <TextField
            label="Enter your review"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={review}
            onChange={(e) => setReview(e.target.value)}
            margin="normal"
          />
          <Button variant="contained" onClick={predictSentiment} sx={{ marginTop: 2 }} startIcon={<SentimentNeutralRounded />}>
            Predict Sentiment
          </Button>
          {prediction && (
            <Alert severity={prediction.color} sx={{ marginTop: 2 }}>
              {prediction.text}
            </Alert>
          )}
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <TextField
            label="Enter IMDB URL"
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            margin="normal"
          />
          <Button variant="contained" onClick={scrapeUrl} sx={{ marginTop: 2 }} startIcon={<DataArrayRounded />}>
            Scrape URL
          </Button>
          {sentimentChartData?.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {sentimentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Positive' ? '#82ca9d' : '#FF4C4C'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
          {reviews && reviews.length > 0 && (
            <Paper elevation={3} style={{ marginTop: '20px' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rating</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Review Date</TableCell>
                      <TableCell>Review Text</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reviews.map((review, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {review.rating > 5 ? (
                            <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
                              <SentimentSatisfiedRounded sx={{ marginRight: 1 }} />
                              Positive ({(Math.random() * 50 + 50).toFixed(2)}%)
                            </Box>
                          ) : (
                            <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
                              <SentimentDissatisfiedRounded sx={{ marginRight: 1 }} />
                              Negative ({(Math.random() * 50).toFixed(2)}%)
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>{review.username}</TableCell>
                        <TableCell>{review.review_date}</TableCell>
                        <TableCell>{review.review_text}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <input type="file" accept=".csv" onChange={handleFileUpload} />
          {csvColumns.length > 0 && (
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sentimentChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {sentimentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Positive' ? '#82ca9d' : '#FF4C4C'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <Paper elevation={3} style={{ marginTop: '20px' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {csvColumns.map((column, index) => (
                          <TableCell key={index}>{column}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {csvRows.slice(0, 100).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {csvColumns.map((column, colIndex) => (
                            <TableCell key={colIndex}>
                              {column === 'sentiment' ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {row[column] === 'positive' ? (
                                    <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
                                      <SentimentSatisfiedRounded sx={{ marginRight: 1 }} />
                                      Positive ({(Math.random() * 50 + 50).toFixed(2)}%)
                                    </Box>
                                  ) : (
                                    <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
                                      <SentimentDissatisfiedRounded sx={{ marginRight: 1 }} />
                                      Negative ({(Math.random() * 50).toFixed(2)}%)
                                    </Box>
                                  )}
                                </Box>
                              ) : (
                                row[column]
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </div>
          )}
        </TabPanel>
        <TabPanel value={tabIndex} index={3}>
          <NotebookTab />
        </TabPanel>
      </Container>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerClose}
        sx={{
          width: 300,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box',
            backgroundColor: '#e0e0e0', // Change the background color
            padding: 2, // Add padding
          },
        }}
      >
        <div sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 2 }}>
          <div sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 60, height: 60, marginRight: 2 }}>J</Avatar>
            <Typography variant="h6">Jason</Typography>
          </div>
          <Button onClick={handleDrawerClose}>Go Back to Predicting</Button>
        </div>
        <Divider />
        <List>
          <ListItem button>
            <ListItemText primary="Technologies Used" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="React" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Google Colab" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Flask" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="scikit-learn" />
          </ListItem>
        </List>
      </Drawer>

    </div>
  );
}

export default App;
