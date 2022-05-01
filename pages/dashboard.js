import {useEffect, useState} from 'react'
import {ethers} from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
    nftAddress,
    nftMarketAddress,
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function Dashboard() {
    const [nfts, setNfts] = useState([])
    const [soldItems, setSold] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    useEffect(() => {
        loadNFTs()
    }, [])

    async function loadNFTs() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        
        const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
        const contract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, signer)
        const data = await contract.fetchMarketItems()
    
        const items = await Promise.all(data.map(async i => {
          const tokenUri = await tokenContract.tokenURI(i.tokenId)
          const meta = await axios.get(tokenUri)
          let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
          }
          return item
        }))
        
        const soldItems = items.filter(i => i.sold)
        setNfts(items)
        setSold(soldItems)
        setLoadingState('loaded') 
    }
    return (
        <div>
            <div className="p-4">
                <h2 className="text-2xl py-2">Items Listed</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                    nfts.map((nft, i) => (
                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                        <img src={nft.image} className="rounded" />
                        <div className="p-4 bg-black">
                        <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                        </div>
                    </div>
                    ))
                }
                </div>
            </div>
            <div className="p-4">
                <h2 className="text-2xl py-2">Items sold</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                    soldItems.map((nft, i) => (
                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                        <img src={nft.image} className="rounded" />
                        <div className="p-4 bg-black">
                        <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                        </div>
                    </div>
                    ))
                }
                </div>
            </div>
        </div>
    )

}