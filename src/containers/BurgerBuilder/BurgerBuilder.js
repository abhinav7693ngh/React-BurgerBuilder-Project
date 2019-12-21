import React, { Component } from 'react'
import Aux from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';



const INGREDIENT_PRICES = {
    salad : 0.5,
    cheese : 0.4,
    meat : 1.3,
    bacon : 0.7
}

export class BurgerBuilder extends Component {
    state = {
        ingredients : null,
        totalPrice : 4,
        purchasable : false,
        purchasing : false,
        loading : false,
        error : false
    }

    componentDidMount() {
        axios.get('https://react-burgerbuilder-proj-f9ebe.firebaseio.com/ingredients.json')
            .then(response => {
                this.setState({
                    ingredients : response.data
                });
            }).catch(error => {
                this.setState({
                    error : true
                });
            })
    }


    updatePurchaseState =  (ingredients) =>{
        const sum = Object.keys(ingredients)
            .map((igkey) => {
                return ingredients[igkey]
            })
            .reduce((sum,el) => {return sum+el},0);
        this.setState({purchasable:sum>0});
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount + 1;
        const updatedIngredient = {
            ...this.state.ingredients
        }
        updatedIngredient[type] = updatedCount;
        const priceAddition  = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({
            totalPrice : newPrice,
            ingredients : updatedIngredient
        })
        this.updatePurchaseState(updatedIngredient);
    }

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        if(oldCount <= 0 ){
            return;
        }
        const updatedCount = oldCount - 1;
        const updatedIngredient = {
            ...this.state.ingredients
        }
        updatedIngredient[type] = updatedCount;
        const priceDeduction  = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceDeduction;
        this.setState({
            totalPrice : newPrice,
            ingredients : updatedIngredient
        })
        this.updatePurchaseState(updatedIngredient);
    }

    purchaseHandler = () => {
        this.setState({
            purchasing:true
        })
    }

    purchaseCancelHandler = () =>{
        this.setState({
            purchasing : false
        })
    }

    purchaseContinueHandler = () =>{
        this.setState({
            loading : true
        })
        //alert('You Continue');
        const order = {
            ingredients : this.state.ingredients,
            price : this.state.totalPrice,
            customer : {
                name : 'Abhinav',
                address : {
                    street : 'MyStreet',
                    pincode : '244001',
                    country : 'India'
                },
                email : 'myemail@gmail.com'
                },
            deliveryMethod : 'fastest'
            }
        axios.post('/orders.json',order)
            .then(response => {
                if(this.state.loading){
                    this.setState({
                        loading : false,
                        purchasing :false
                    })
                }
            })
            .catch(error => {
                if(this.state.loading){
                    this.setState({
                        loading : false,
                        purchasing : false
                    })
                }
            });
    }


    render() {
        const disabledInfo = {
            ...this.state.ingredients
        };
        for (let key in disabledInfo){
            disabledInfo[key] = disabledInfo[key] <= 0
        }
        let orderSummary = null; 
      
        let burger = this.state.error ? <p>Error loading ingredients !!!</p> : <Spinner />;
        if(this.state.ingredients){
        burger = (
            <Aux>
                <Burger ingredients = {this.state.ingredients}/>
                <BuildControls 
                    ingredientAdded={this.addIngredientHandler}
                    ingredientRemoved={this.removeIngredientHandler}
                    disabled={disabledInfo}
                    price={this.state.totalPrice}
                    purchasable={this.state.purchasable}
                    ordered = {this.purchaseHandler}/>
                </Aux>
            );
                orderSummary = <OrderSummary ingredients={this.state.ingredients} 
                            purchaseCancel= {this.purchaseCancelHandler}
                            purchaseContinue = {this.purchaseContinueHandler}
                            price = {this.state.totalPrice}/>   }
        if(this.state.loading){
            orderSummary = <Spinner />
            }
        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
        )
    }
}

export default withErrorHandler(BurgerBuilder, axios);
