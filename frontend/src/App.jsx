import React from "react";
import axios from "axios";
import MicRecorder from 'mic-recorder-to-mp3';
const audioRecorder = new MicRecorder({ bitRate: 128 });


class App extends React.Component{

    constructor(props){
        super(props);
        this.state={
            isblocked: false,
            blobUrl: '',
            isrecording:false,
            audio:''
        }
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.handleaudiofile = this.handleaudiofile.bind(this);
    }
    
    
    componentDidUpdate(){
        navigator.getUserMedia({ audio: true ,video:false},
            () => {
              console.log('Permission Granted');
              this.setState({ isblocked: false });
            },
            () => {
              console.log('Permission Denied');
              this.setState({ isblocked: true })
            },
          );
    }

    start = () => {
    
    if(this.state.isblocked){
        console.log('permission Denied');
    }else{
        audioRecorder.start()
        .then(()=>{
               this.setState({
                isrecording:true
            });
        }).catch((e)=> console.log(e));
    }
    };
  
    stop = () => {
       audioRecorder
            .stop()
            .getMp3()
            .then(([buffer,blob])=>{
                const blobUrl = URL.createObjectURL(blob)
                this.setState({blobUrl,isrecording:true});
                var d = new Date();
                var file = new File([blob],d.valueOf(),{ type:"audio/wav" })
                console.log(file);
                this.handleaudiofile(file);
            }).catch((e)=>console.log('We could not retrieve your message'));
   };
    
   handleaudiofile(ev){
    let file = ev;
    let fileName = ev.name;
    let fileType = ev.type;
    axios.post("http://localhost:5000/sign_s3",{
      fileName : fileName,
      fileType : fileType
    })
    .then(response => {
      var returnData = response.data.data.returnData;
      var signedRequest = returnData.signedRequest;
      var url = returnData.url;
      var options = {
        headers: {
          'Content-Type': fileType,
        }
      };
      axios.put(signedRequest,file,options)
      .then(result => { this.setState({audio: url,
      },()=>console.log(this.state.audio))
      alert("audio uploaded")})
      .catch(error => {
        alert("ERROR " + JSON.stringify(error));
      })
    })
    .catch(error => {
      alert(JSON.stringify(error));
    })
}

    render(){
        return(
            <>
            <button onClick={this.start} disabled={this.state.isrecording} type="button">Start</button>
            <button onClick={this.stop}  type="button">Stop</button>
                <audio src={this.state.blobUrl} controls="controls"/>
             </>   
        )
    }
}

export default App;