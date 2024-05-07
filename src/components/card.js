import "./card.css";
import "./flip-transition.css";
import Card from "../components/MainCard";
import avaxtrucks from "../assets/avaxtrucks/background.png";

function Card1({onClick}) {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-back"><Card 
      image={avaxtrucks}
      alt="avaxtrucks"
      title="avaxtrucks BACK"
      link=""
      line1=""
      line2=""
      line3=""
      totalminted="Total Complete: 0/10000"
      /></div>
      <div className="card-front"><Card 
      image={avaxtrucks}
      alt="avaxtrucks"
      title="avaxtrucks FRONT"
      link=""
      line1=""
      line2=""
      line3=""
      totalminted="Total Complete: 0/10000"
      /></div>
    </div>
  );
}

export default Card1;
