import React, { useEffect, useState } from 'react';
import "rbx/index.css";
import { Card, Column, Container, Button } from "rbx";
import { makeStyles } from "@material-ui/core/styles";
import Divider from '@material-ui/core/Divider';
import Sidebar from "react-sidebar";

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
}));


const App = () => {
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

  const addItemToCart = (product, size) => {
    setCart([...cart, new Array(product, size)])
    setSidebar(true)
    console.log(cart)
  }
  
  const ProductList = ({products}) => {
    const styles = productStyles();
    const sizes = ['S', 'M', 'L', 'XL']
  
    return(
      <Column.Group vcentered multiline className={styles.container}>
        {products.map(product => 
                <Column size="one-quarter">
                  <Card className={styles.card}>
                    <Card.Image className={styles.image}><img src={`/data/products/${product.sku}_1.jpg`} alt={product.sku}/></Card.Image>
                    <Card.Content key={product.sku}> 
                      <h4 className={styles.title}>{product.title}</h4>
                      {sizes.map(size => <Button onClick={() => addItemToCart(product, size)} className={styles.sizes}>{size}</Button>)}
                      <Divider variant="middle" className={styles.divider}/>
                      <h6 className={styles.price}>{`$${product.price}`}</h6>
                      <h6 className={styles.description}>{product.style}</h6>
                    </Card.Content>
                  </Card>
                </Column>)}
      </Column.Group>
    );
  }

  const styles = productStyles();
  return (
    <div>
      <Sidebar
        sidebar={<b>Here is your cart</b>}
        open={sidebar}
        onSetOpen={() => setSidebar(false)}
        styles={{ sidebar: { background: "white", left: window.innerWidth - 300} }}
        pullRight={true}
      >
        <button onClick={() => setSidebar(true)}> Cart </button>
      </Sidebar>

    <Container>
      {/* <h1>{cart[0]}</h1> */}
      <text className={styles.header}>My Shopping Cart</text>
      <ProductList products={products}/>
    </Container>

    
      
    </div>
  );
};

export default App;