import React from 'react'
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Carousel from 'react-bootstrap/Carousel';
import { motion } from "framer-motion";
import Card from 'react-bootstrap/Card';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faThumbsUp} from '@fortawesome/free-solid-svg-icons';
// import { faFacebookF } from '@fortawesome/free-brands-svg-icons'; // Import specific icons
// import { faFacebook, faEnvelope } from '@fortawesome/free-solid-svg-icons'; // Import specific icons
export default function Home() {
  return (
    <div>
 <motion.div
      className="text-lg font-bold text-purple-600"
      animate={{ x: ["100%", "-50%"] }}
      transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      style={{ whiteSpace: "nowrap" }}
    >
      🎉 Welcome to Yegna Trading Store – Best Deals Everyday! 🎉
    </motion.div>
    
    
 <Container>
      <Row>
        <Col xs={6} md={3}>
          <div id='TOP' style={{height:'500px',backgroundImage:'url(image2.png)',marginLeft:'-70px',width:'400px'}}>
    
    <br/><br/><motion.h2 style={{marginLeft:'0px',marginTop:'',color:'blue'}}
      className="text-2xl font-bold text-blue-600"
      animate={{ y: [0, -20, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    >
          {/* <FontAwesomeIcon icon={faThumbsUp} /> */}  🛒 Shop our quality Rebar <br/> Products! 
    </motion.h2>
   
          </div>
        
        </Col>
        <Col xs={6} md={9}>
          <div style={{backgroundImage:'url(image3.png)',height:'500px',marginLeft:'40px',opacity:'0.7', width:'100%'}}>
 
   <motion.h2
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 10 }}
      transition={{ duration: 4 }}
      style={{ fontSize: "2rem", fontWeight: "bold", color: "green" ,marginLeft:'150px'}}
    >
      Welcome to our E-commerce
    </motion.h2>
    <motion.h4  
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: -50 }}
      transition={{ duration: 4 }}
      style={{ fontSize: "2rem", fontWeight: "bold", color: "green" ,marginLeft:'200px'}}
    >
      Digital platform
    </motion.h4>

 <div style={{width:'500px',height:'500px',marginLeft:'150px'}}>
<Carousel data-bs-theme="dark">
      <Carousel.Item>
        <img style={{height:'400px'}}
          className="d-block w-100"
          src="image1.png"
          alt="First slide"
        />
        
      </Carousel.Item>
      <Carousel.Item>
        <img  style={{height:'400px'}}
          className="d-block w-100"
          src="image4.png"
          alt="Second slide"
        />
        
      </Carousel.Item>
      <Carousel.Item>
        <img  style={{height:'400px'}}
          className="d-block w-100"
          src="image1.png"
          alt="Third slide"
        />
       </Carousel.Item>
    </Carousel>
 </div>

    
   

          </div   >
        </Col>
       
      </Row>
    </Container>
    <br/>
    <div style={{ margin:'5px',marginLeft:'00px',width:'100%',backgroundColor:'GrayText'}} >
<Carousel data-bs-theme="dark">
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="image5.png"
          alt="First slide"
        />
        
      </Carousel.Item>
      <Carousel.Item>
        <img 
          className="d-block w-100"
          src="image6.png"
          alt="Second slide"
        />
        
      </Carousel.Item>
      <Carousel.Item>
        <img 
          className="d-block w-100"
          src="image2.png"
          alt="Third slide"
        />
       
      </Carousel.Item>
    </Carousel>


      
    </div>
    <br/> <br/> <br/>
<div id='hab' style={{backgroundColor:'', margin:'3px',marginRight:'30px'}}>
<h1 style={{textAlign:'center'}}>About Us - Yegna Tradinng</h1>
<p style={{marginLeft:'25px',marginRight:'15px'}}>Name Meaning: "Yegna" translates to "ours" in Amharic, reflecting their commitment to serving local customers like construction firms, real estate developers, government organizations, and individuals.
Core Business: They primarily supply high-quality rebar (reinforcement bars) for the construction industry, ranging from 8mm to 32mm diameters. They also offer related products like staffa (structural steel) and cement (e.g., OPC and PPC types). Emphasis is on affordable, bulk pricing with reliable delivery.
Values: They prioritize integrity, customer service, timely delivery, and quality—philosophies like "Trade with trust & integrity!" are central to their brand.
Expansion Plans: Aiming to grow paid-up capital to 20 million Ethiopian Birr by bringing in experienced investors.

Contact and Online Presence

Phone: +251 943 000 003 / 004 / 005 / 006 / 007
Website: yegnatradinget.com (features blogs on topics like plywood cutting, cement comparisons, and rebar delivery tips)
X (Twitter): @yegnatrading – Active with posts on construction advice and promotions (e.g., recent tips on PPC cement and rebar orders).
Other: They have a LinkedIn page with 852 followers and listings on Ethiopian business directories like 2merkato.com and AddisBiz.com.
</p>
</div>

<div style={{backgroundColor:'black',color:'white',marginLeft:'3px',marginRight:'20px'}}>
<h1>Contact </h1>
<Container>
      <Row>
        <Col xs={6} md={4}>
          <Card style={{ width: '18rem', backgroundColor:'black',color:'white'}}>
      <Card.Body>
        <Card.Title>Social media</Card.Title>
        <Card.Text>
          <a id='a' href='h4838543@gmail.com '>Email:</a><br/>
          <a  id='a'href='https://t.me/habte0621'>Telegram</a><br/>
          <a id='a'href='https://teotokos'>Youtube</a><br/>
          <a id='a'href='https://tikitok'>Tiktok</a><br/>
          {/* <a id='a'href='https://t.me/habte0621'><FontAwesomeIcon style={{fontSize:'20px',color:'green'}} icon={faFacebookF} /></a> */}
        </Card.Text>
        
      </Card.Body>
       </Card>
        </Col>
        <Col xs={6} md={4}>
          <Card style={{ width: '18rem', backgroundColor:'black',color:'white'}}>
      <Card.Body >
        <Card.Title>Social media</Card.Title>
        <Card.Text>
          <a id='a' href='/'>Home</a><br/>
          <a  id='a'href='/Sales'>Sales</a><br/>
          <a id='a'href='/Add-purchase'>add purchase</a><br/>
          <a id='a'href='/purchase'>purchase</a><br/>
          <a id='a'href='/Add-sales'> Add sales</a><br/>
          <a id='a'href='/Balance'>Balance</a><br/>
          
        </Card.Text>
        
      </Card.Body>
       </Card>
        </Col>
        <Col xs={6} md={4}>
          <Card style={{ width: '18rem' ,backgroundColor:'black',color:'white'}}>
      
      <Card.Body style={{color:''}}>
        <Card.Title>Adresee</Card.Title>
        <Card.Text>
         <p>Addis Ababa Ednamol 4th floor</p>
         <p>Addis Ababa debrewerk tabwor </p>
         <p>Adama Ednamol 5th floor</p>
         <p>Bahir Dar dibanbesa  6th floor</p>
         <p>Mekele sherende 4th floor</p>
        </Card.Text>
        
      </Card.Body>
    </Card>
        </Col>
      </Row>
    </Container>
</div>

    </div>
  )
}
