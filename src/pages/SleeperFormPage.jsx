import SleeperForm from '../components/sleeper/SleeperForm'
import '../components/MainPage.css'

const SleeperFormPage =()=>{

    return(<>
    <div className="main-page-container">
        <h2 style={ {marginBottom:'1rem'} }>Connect to your Sleeper league.</h2>
        <SleeperForm/>
    </div>
    
    </>)
}

export default SleeperFormPage