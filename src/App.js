import React, { useEffect, useState } from 'react';
import "rbx/index.css";
import { Card, Column, Container, Button, Title, Message } from "rbx";
import { makeStyles } from "@material-ui/core/styles";
import Divider from '@material-ui/core/Divider';
import Sidebar from "react-sidebar";
import "firebase/database";
// import "firebase/auth";
import firebase from "firebase/app";
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

const firebaseConfig = {
  apiKey: "AIzaSyDpKL6lxJlwVKi2P4DyqkFKk_u6n5DqnbI",
  authDomain: "jonathan-shopping-cart.firebaseapp.com",
  databaseURL: "https://jonathan-shopping-cart.firebaseio.com",
  projectId: "jonathan-shopping-cart",
  storageBucket: "jonathan-shopping-cart.appspot.com",
  messagingSenderId: "1054191744298",
  appId: "1:1054191744298:web:dcd7fd4bd3347338391a53"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref();

const productStyles = makeStyles(theme => ({
  container: {
    paddingTop: 20
  },
  card: {
    textAlign: 'center',
    shadowOffset: {width: 10,  height: 10},
    shadowColor: 'black',
    shadowOpacity: 1.0,
  }, 
  image: {
    paddingTop: 10, 
    paddingBottom: -20
  },
  divider: {
    position: 'static',
    bottom: -20
  },
  title: {
    marginTop: -10, 
    height: 60,
    fontWeight: 'bold'
  },
  price: {
    marginTop: 5
  },
  header: {
    fontSize: 30, 
  }, 
  description: {
    color: 'grey'
  },
  sizes: {
    marginTop: -30,
    marginBottom: 5,
    width: 35,
    marginRight: 3,
    marginLeft: 3
  },
  remove: {
    position: 'absolute',
    right: 20,
    marginTop: 30,
  },
  cartItem: {
    marginTop: 50,
    marginBottom: 50,
    marginLeft: 15
  },
  cart: {
    marginLeft: 5,
    fontWeight: 'bold', 
    fontSize: 20,
  },
}));



const App = () => {

  useEffect(() => {
    firebase.auth().onAuthStateChanged(setUser);
  }, []);

  const Banner = ({ user, title }) => (
    <React.Fragment>
      { user ? <Welcome user={ user } /> : <SignIn /> }
      <Title>{ title || '[loading...]' }</Title>
    </React.Fragment>
  );

  const Welcome = ({ user }) => (
    <Message color="info">
      <Message.Header>
        Welcome, {user.displayName}
        <Button primary onClick={() => firebase.auth().signOut()}>
          Log out
        </Button>
      </Message.Header>
    </Message>
  );

  const SignIn = () => (
    <StyledFirebaseAuth
      uiConfig={uiConfig}
      firebaseAuth={firebase.auth()}
    />
  );

  const uiConfig = {
    signInFlow: 'popup',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => false
    }
  };

  const [user, setUser] = useState(null);
  useEffect(() => {
    firebase.auth().onAuthStateChanged(setUser);
  }, []);

  const [data, setData] = useState({});
  const products = Object.values(data);
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('./data/products.json');
      const json = await response.json();
      setData(json);
    };
    fetchProducts();
  }, []);

  const [sidebar, setSidebar] = useState(false) 
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)

  const [inventory, setInventory] = useState({});

  useEffect(() => {
    const handleData = snap => {
      if (snap.val()) setInventory(snap.val());
    }
    db.on('value', handleData, error => alert(error));
    return () => { db.off('value', handleData); };
  }, []);

  const addItemToCart = (product, size) => { 
    let newTotal = (total + product.price)
    setTotal(parseFloat(newTotal.toFixed(2)))
    for (var i = 0; i < cart.length; i++) {
      if(cart[i][0].sku === product.sku && cart[i][1] === size) {
        let new_value = cart[i][2] + 1
        cart[i] = new Array(product, size, new_value); 
        setCart(cart)
        setSidebar(true)
        return; 
      }
    }
    setCart([...cart, new Array(product, size, 1)])
    setSidebar(true)
    // subtract from firebase 
  } 

  const removeItemFromCart = (product, size) => { 
    let newTotal = (total-product.price)
    setTotal(parseFloat(newTotal.toFixed(2)))
    const itemIndex = cart.findIndex(item => item[0].sku === product.sku && item[1] === size) 
    console.log(itemIndex)
    let newCart 
    if(cart[itemIndex][2] === 1) {
      newCart = [...cart.slice(0, itemIndex), ...cart.slice(itemIndex+1)]
    }
    else {
      newCart = [...cart.slice(0, itemIndex), new Array(product, size, cart[itemIndex][2]-1),...cart.slice(itemIndex+1)]
    }
    setCart(newCart)
    setSidebar(true)
    // add item to firebase 
  }
  
  const isInStock = (product, size) => {
    
    for(var i = 0; i < Object.keys(inventory).length; i++) {      
      var currSku = Object.keys(inventory)[i]
      if(parseInt(currSku) === product.sku) {
        var sizesInStock = inventory[parseInt(currSku)]
        return sizesInStock && sizesInStock[size] > 0 ? true : false 
      }
    }
    return false 
  }

  const renderInStock = (product) => {
    const sizes = ['S', 'M', 'L', 'XL']
    return( 
      <div>{sizes.map(size => 
        isInStock(product, size) ?
        <Button onClick={() => addItemToCart(product, size)} className={styles.sizes}>{size}</Button> :
        <Button className={styles.sizes} disabled={true}>{size}</Button>
        )}</div> 
    )
  }

  const ProductList = ({products}) => {
    const styles = productStyles();
    return(
      <Column.Group vcentered multiline className={styles.container}>
        {products.map(product => 
                <Column size="one-quarter">
                  <Card className={styles.card}>
                    <Card.Image className={styles.image}><img src={`/data/products/${product.sku}_1.jpg`} alt={product.sku}/></Card.Image>
                    <Card.Content key={product.sku}> 
                      <h4 className={styles.title}>{product.title}</h4>
                      {renderInStock(product)}
                      <Divider variant="middle" className={styles.divider}/>
                      <h6 className={styles.price}>{`$${product.price}`}</h6>
                      <h6 className={styles.description}>{product.style}</h6>
                    </Card.Content>
                  </Card>
                </Column>)}
      </Column.Group>
    );
  }

  const renderCartItems = () => {
    const cartStyle = productStyles()
    return(
      cart.length !== 0 ? 
      cart.map((item) => 
      <div className = {cartStyle.cartItem}>
        <div className={cartStyle.remove}>
          <Button onClick={() => removeItemFromCart(item[0], item[1])} className={styles.sizes}>-1</Button>
        </div>
        <div style={{fontWeight:'bold'}}>{item[0].title}</div> 
        <div style={{fontStyle:'italic'}}>({item[1]}): {item[2]} x ${item[0].price}</div>
      </div>
      ) 
      :
      <div className = {cartStyle.cartItem}>cart is empty</div>
    )
  }


  const styles = productStyles();
  return (
    <div>
      <Sidebar
        sidebar={
        <div>
          <div className={styles.cart}>Your Cart</div>
          <div>{renderCartItems()}</div>
          <div className={styles.cart}>Total: ${total}</div>
        </div>
      }
        open={sidebar}
        onSetOpen={() => setSidebar(false)}
        styles={{sidebar: { background: "white", left: window.innerWidth - 400, position: 'fixed'} }}
        pullRight={true}
      >
        {/* <button onClick={() => setSidebar(true)}> Cart </button> */}
       
      </Sidebar>

    <Container>
      <Banner title={"Your Shopping Cart"} user={ user } /> 
      <Button align="right" onClick={() => setSidebar(true)}>Cart</Button>
      <ProductList products={products}/>
    </Container>

    
      
    </div>
  );
};

export default App;