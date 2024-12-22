import React, { useState, useEffect } from 'react';
import { utils, writeFile } from 'xlsx';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  getFirestore,
  deleteDoc
} from 'firebase/firestore';
import {initializeApp} from 'firebase/app'
import './main.css'
function UserInterface() {
  const firebaseConfig = {
    apiKey: "AIzaSyDDysDetkW22iKllrT-ThOC0yxcu7N8Gd8",
    authDomain: "kushagrastore-b983c.firebaseapp.com",
    projectId: "kushagrastore-b983c",
    storageBucket: "kushagrastore-b983c.firebasestorage.app",
    messagingSenderId: "597443297424",
    appId: "1:597443297424:web:3a3984e0b44c8cd92f1815",
    measurementId: "G-YQGS3B9GMM"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, 'items'));
      const fetchedItems = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(fetchedItems);
    };
    fetchItems();
  }, []);

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, `<span style="color: blue; border-radius: 4px; font-weight: bold;">$1</span>`);
  };

  const filteredItems = items
  .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
  .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      style={{
        padding: '10px',
        paddingTop:0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '100%',
      }}
    >
      <div style={{position:'fixed', backgroundColor:'white', padding:8, width:'100vw', display:'flex', justifyContent:'center', flexDirection:'column', alignItems:'center'}} >
      <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'90%'}} >
      <h1 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Item List</h1>
      </div>
      <input
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: '5px',
          width:'85%',
          fontSize: '14px',
          height:30
        }}
      />
      </div>
      <table
        border="1"
        cellPadding="5"
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: '12px',
          marginBottom: '10px',
          marginTop:90,
          border:'none'
        }}
      >
        <thead>
        <tr style={{ position: 'sticky', top: 90, backgroundColor: '#fff', zIndex: 5 }}>
          <th>No</th>
          <th>Name</th>
          <th>MRP</th>
          <th>Qty</th>
          <th>SP</th>
        </tr>
      </thead>
        <tbody>
          {filteredItems.map((item, index) => (
            <React.Fragment key={item.id}>
              {item.prices.map((priceOption, idx) => (
                <tr style={{backgroundColor: 'white'}} key={`${item.id}-${idx}`}>
                  <td >{idx === 0 ? index + 1 : ''}</td>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: idx === 0 ? highlightMatch(item.name, search) : '',
                    }}
                  />
                  <td >{idx === 0 ? item.mrp : ''}</td>
                  <td>{priceOption.quantity}</td>
                  <td ><span style={{boxShadow:'0px 10px 10px rgba(0, 0, 0, 0.3)', padding:5, borderRadius:5, color:'blue'}} >{idx === 0 ? item.sellingPrice : ''}</span></td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default UserInterface;
