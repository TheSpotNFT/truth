import './flippable-card.css';
import Card1 from './card';
import {CSSTransition} from 'react-transition-group';
import {useState} from 'react';


function FlippableCard() {
    const [showFront, setShowFront] = useState(true);
    return(
        <div className="flippable-card-container">
            <CSSTransition
                in={showFront}
                timeout={300}
                classNames='flip'
            >
                <Card1 onClick={() => {
                    setShowFront((v) => !v);
                }}/>
            </CSSTransition>
        </div>
    );
}

export default FlippableCard;