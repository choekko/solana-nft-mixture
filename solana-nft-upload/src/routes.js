import {ComposableNFTUpload} from "./mixture-machine";

export function routesFunc(app, _id){
    app.post('/upload', (req,res)=>{
        let metadata = req.body.metadata
        let network = req.body.network
        let composableNFTIndex = req.body.composableNFTIndex
        let parentNFTAddress = req.body.parentNFT
        if(metadata && network){
            ComposableNFTUpload(
                metadata, 
                _id, 
                network,
                composableNFTIndex,
                parentNFTAddress
                )
            .then((result)=>{
                res.json({
                    "status":result.status, 
                    "arweaveLink": result.arweaveLink,
                    "mixture": result.mixture
                })
            })
            .catch(err=>{
                console.log("err : ", err);
                res.status(500).json(
                    {"status":"fail", "reason":"Upload error occured", "err": err}
                    )
            })
        }else{
            res.status(400).json({"status":"fail", "reason":"wrong input"})
        }
    })
}
