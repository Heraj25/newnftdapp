import { useState, useEffect } from 'react';
import { NFTStorage, File } from 'nft.storage'
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import axios from 'axios';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import { AwesomeButton } from 'react-awesome-button';
import 'react-awesome-button/dist/styles.css';


// Components
import Spinner from 'react-bootstrap/Spinner';
import Navigation from './components/Navigation';

// ABIs
import NFT from './abis/NFT.json'

// Config
import config from './config.json';
import ContactUs from './components/ContactUs';


function App() {
  const [visble,setVisible]=useState("none")
  const [bt,setBt]=useState("block")
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const[nft, setNFT] = useState(null)

  const[name, setName] = useState("")
  const[description, setDescription] = useState("")
  const[image, setImage] = useState(null)

  
  const[url, setURL] = useState(null)

  const[message, setMessage] = useState("")
  const [isWaiting, setIsWaiting] = useState(false)

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)


    const network = await provider.getNetwork()

    const nft = new ethers.Contract(config[network.chainId].nft.address, NFT, provider)
    setNFT(nft)

    
  }

  const submitHandler = async (e) => {
    e.preventDefault()           //stops refreshing the page when Generate button is clicked
    
    //popping messages for the user to give text prompt for getting an NFT image
    if(name === "" && description === "") {
      window.alert("Please specify the name and description of the NFT image")
      return
    }

    if(name === "" && description !== ""){
      window.alert("Please specify the name of the NFT image")
    }

    if(name !== "" && description === "") {
      window.alert("Please give the description of the NFT image")
      return
    }

    //create a 

    setIsWaiting(true)

    const imageData = createImage() //Calling an AI API to generate the image from the user description


    const url = await uploadImage(imageData) //Uploading the image to IPFS(NFT.Storage)

    await mintImage(url) //minting the NFT

    setIsWaiting(false)

    setMessage("")

    console.log("success")
  }

  const createImage = async (e) => {
    setMessage("Generating the NFT Image...")
    console.log("Generating Image...")

    //The model API
    const URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2'

      const response = await axios({
        url: URL,
        method: 'POST',
        headers: {
          Authorization : 'Bearer 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',   
          Accept: 'application/json' ,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          inputs: description, options: { wait_for_model: true },
        }),
        responseType: 'arraybuffer',
      })             //this is the function to make the API call
  
    const type = response.headers['content-type']
    const data = response.data

    const base64data = Buffer.from(data).toString('base64')
    const img = `data:${type};base64,` + base64data   //  <--- This is to render on our front end react Page
    setImage(img)

    return data
  }

  const uploadImage = async (imageData) => {
    setMessage("Uploading the NFT Image....")
    console.log("Uploading the Image.....")


    //Creating instance of NFT.Storage

    const nftstorage = new NFTStorage({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweENmOTVhZTQ2NkFkRmMxMDBENDhFOTdhZjczNTI4RWJhODk1ODc2MEYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4MTM4NzM5NjM5OSwibmFtZSI6Ik5GVF9rZXkifQ.c3V1jSz9Pcb8qExoaI2Ia4L4_cp8eqDZb9hfTmGq0rk' })

    //Sending a request to store image

    const { ipnft } = await nftstorage.store({
      image: new File([imageData], "image.jpeg", { type: "image/jpeg" }),
      name: name,
      description: description,
    })

    //save the url
    const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`
    setURL(url)

    return url
  }


  //minting process
  const mintImage = async (tokenURI) => {
    setMessage("Waiting for Mint....")
    console.log("Waiting for Mint.....")

    const signer = await provider.getSigner()
    const transaction = await nft.connect(signer).mint(tokenURI, { value: ethers.utils.parseUnits("1", "ether")})
    await transaction.wait()
  }
  

  useEffect(() => {
    loadBlockchainData()
  }, [])


  const getStarted=()=>{
      setVisible("block");
      setBt("none");
  }
  return (
    <>
    <div className='container-flex bt-outer-box' style={{display:bt}}>
      <div className='container-m d-flex justify-content-center bt-box'>
      <p style={{
        fontSize:"60px",
        textAlign:"center",
        color:"white"
      }}>Create Beautiful Art
       with our AI NFT Generator</p>
       <div className="container d-flex justify-content-center">
    <AwesomeButton type="secondary" onPress={getStarted} style={{
      width:"15rem",fontSize:"30px",height:"4rem"
    }}>Get Started</AwesomeButton></div>
    </div>
    </div>
    <div className='container-flex outer' style={{display:visble}}>
    <div className='container-flex contain-main-box'>
      <div className='contain container-flex d-flex justify-content-center align-item-center'  style={{padding:"10px"}}>
      <Navigation account={account} setAccount={setAccount} />
      </div>

      <div className='container form' style={{marginBottom:"20px",backgroundColor:"white"}}>
  
        <form onSubmit={submitHandler} className='form1'>
          <input type="text" placeholder="Create a name..." onChange={(e) => { setName(e.target.value) }} />
          <input type="text" placeholder="Create a description..." onChange={(e) => setDescription(e.target.value)} />
          <input type="submit" value="Create & Mint" />
        </form>

        <div className="image" style={{backgroundColor:"white"}}>
          {!isWaiting && image ? (
            // eslint-disable-next-line jsx-a11y/img-redundant-alt
            <img src={image} alt="Image generated by AI" />
          ) : isWaiting ? (
            <div className="image__placeholder">
              <Spinner animation="border" />
              <p>{message}</p>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>

      {!isWaiting && url && (
        <p>
          View&nbsp;<a href={url} target="_blank" rel="noreferrer">Metadata</a>
        </p>
      )}
                <ContactUs/>
                </div>
    </div>

          </>
  );
}

export default App;
