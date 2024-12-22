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
function App() {
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
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [itemId, setItemId] = useState(null);
  const [itemForEditing, setItemForEditing] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    prices: [{ quantity: '', price: '', mrp: '', sellingPrice: '' }],
  });

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

  const handleExport = () => {
    const data = items.flatMap((item, index) =>
      item.prices.map((priceOption) => ({
        No: index + 1,
        Name: item.name,
        MRP: priceOption.mrp,
        Quantity: priceOption.quantity,
        Price: priceOption.price,
        
        'Selling Price': priceOption.sellingPrice,
      }))
    );

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Items');
    writeFile(wb, 'items.xlsx');
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, `<span style="color: blue; border-radius: 4px; font-weight: bold;">$1</span>`);
  };

  const filteredItems = items
  .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
  .sort((a, b) => a.name.localeCompare(b.name));



  const handleOpenModal = (item = null) => {
    setCurrentItem(item);
    setFormValues(
      item
        ? {
            name: item.name,
            prices: [...item.prices],
          }
        : {
            name: '',
            prices: [{ quantity: '', price: '', mrp:'', sellingPrice: '' }],
          }
    );
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setCurrentItem(null);
  };

  const handleDelete = async (itemId) => {

    const itemRef = doc(db, 'items', itemId);
    await deleteDoc(itemRef); // Deletes the item from Firestore
  
    // Remove the item from the local state
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };
  

  const handleFormChange = (e, index = null) => {
    const { name, value } = e.target;
    console.log(name)

    if (name.startsWith('price') || name.startsWith('quantity') || name.startsWith('mrp') || name.startsWith('sellingPrice')) {
      const updatedPrices = [...formValues.prices];
      const key = name.startsWith('price') ? 'price' : name.startsWith('quantity') ? 'quantity' : name.startsWith('mrp') ? 'mrp' : 'sellingPrice';
      updatedPrices[index][key] = value;
      setFormValues((prev) => ({ ...prev, prices: updatedPrices }));
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddPrice = () => {
    setFormValues((prev) => ({
      ...prev,
      prices: [...prev.prices, { quantity: '', price: '', mrp: '', sellingPrice: ''}],
    }));
  };

  const handleRemovePrice = (indexToRemove) => {
    setFormValues((prev) => ({
      ...prev,
      prices: prev.prices.filter((_, index) => index !== indexToRemove),
    }));
  };
  

  const handleSave = async () => {
    if (currentItem) {
      const itemRef = doc(db, 'items', currentItem.id);
      await updateDoc(itemRef, formValues);
    } else {
      await addDoc(collection(db, 'items'), formValues);
    }

    // Refresh the items list
    const querySnapshot = await getDocs(collection(db, 'items'));
    const fetchedItems = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setItems(fetchedItems);

    handleCloseModal();
  };

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
      <button
        onClick={handleExport}
        style={{ marginBottom: '10px', padding: '10px', fontSize: '14px', width: 125,height:40,borderRadius:5,border:'none',backgroundColor:'black',color:'white' }}
      >
        Export to Excel
      </button>
      <h1 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Item List</h1>
      <button
        onClick={() => handleOpenModal()}
        style={{
          marginBottom: '10px',
          padding: '0px',
          fontSize: '14px',
          width: 125,
          height:40,
          borderRadius:5,
          border:'none',
          backgroundColor:'black',
          color:'white'
        }}
      >
        Add New Item
      </button>
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
          marginTop:110,
          border:'none'
        }}
      >
        <thead>
        <tr style={{ position: 'sticky', top: 109, backgroundColor: '#fff', zIndex: 5 }}>
          <th>No</th>
          <th>Name</th>
          <th>MRP</th>
          <th>Qty</th>
          <th>BP</th>
          <th>SP</th>
          <th>Act</th>
        </tr>
      </thead>
        <tbody>
          {filteredItems.map((item, index) => (
            <React.Fragment key={item.id}>
              {item.prices.map((priceOption, idx) => (
                <tr style={{backgroundColor: item.id === itemId ? '#B8B8B8' : ''}} key={`${item.id}-${idx}`}>
                  <td >{idx === 0 ? index + 1 : ''}</td>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: idx === 0 ? highlightMatch(item.name, search) : '',
                    }}
                  />
                  <td >{priceOption.mrp}</td>
                  <td>{priceOption.quantity}</td>
                  <td>{priceOption.price}</td>
                  <td ><span style={{boxShadow:'0px 10px 10px rgba(0, 0, 0, 0.3)', padding:5, borderRadius:5, color:'bue'}} >{priceOption.sellingPrice}</span></td>
                  <td >
                  {idx === 0 && (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1}} >
      <button
        onClick={() => {
          setActionModalVisible(true)
          setItemId(item.id)
          setItemForEditing(item)
        }}
        style={{
          padding: '5px',
          fontSize: '10px',
          backgroundColor:'yellow',
          border:'none',
          borderRadius:5,
          width:30,
          boxShadow: '0px 10px 10px rgba(0, 0, 0, 0.3)'
        }}
      >
        Edit
      </button>
    </div>
  )}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    
      {modalVisible && (
  <div
    style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
      width: '90%',
      maxWidth: '300px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '5px',
    }}
  >
    <h2
      style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: '15px',
        textAlign: 'center',
      }}
    >
      {currentItem ? 'Edit Item' : 'Add Item'}
    </h2>

    <input
      placeholder="Name"
      type="text"
      name="name"
      value={formValues.name}
      onChange={handleFormChange}
      style={{
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    />

    {formValues.prices.map((price, index) => (
      <div
        key={index}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          gap: '5px',
          flexDirection:'row'
        }}
      >

<input
      placeholder="MRP"
      type="number"
      name={`mrp-${index}`}
      value={price.mrp}
      onChange={(e) => handleFormChange(e, index)}
      style={{
        width: '20%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    />
    <input
          placeholder="Quantity"
          type="text"
          name={`quantity-${index}`}
          value={price.quantity}
          onChange={(e) => handleFormChange(e, index)}
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width:'20%'
          }}
        />
        <input
          placeholder="Buying Price"
          type="number"
          name={`price-${index}`}
          value={price.price}
          onChange={(e) => handleFormChange(e, index)}
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width:'20%'
          }}
        />
        <input
      placeholder="Selling Price"
      type="number"
      name={`sellingPrice-${index}`}
      value={price.sellingPrice}
      onChange={(e) => handleFormChange(e, index)}
      style={{
        width: '20%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    />
        {index !== 0 &&(
        <button
          onClick={() => handleRemovePrice(index)}
          style={{
            backgroundColor: '#ff4d4f',
            color: '#ffffff',
            padding: '10px',
            fontSize: '14px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Remove
        </button>
      )}
      </div>
    ))}
    
    <button
      onClick={handleAddPrice}
      style={{
        width: '100%',
        padding: '10px',
        backgroundColor: '#333333',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      Add Price
    </button>

    <div style={{display:'flex', flexDirection:'row', justifyContent:'space-evenly', width:'100%', alignItems:'center'}} >
      <button
      onClick={handleSave}
      style={{
        width: '45%',
        padding: '10px',
        backgroundColor: '#4CAF50',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      Save
    </button>
  
    <button
      onClick={handleCloseModal}
      style={{
        width: '45%',
        padding: '10px',
        backgroundColor: '#f44336',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      Cancel
    </button>

    </div>

  </div>
)}


{actionModalVisible && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}
  >
    <div
      style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        width: '80%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
      }}
    >
      <div
        style={{
          display: permissionModalVisible?'none':'flex',
          gap: '10px',
          justifyContent: 'space-evenly',
          width: '100%',
        }}
      >
        <button
          onClick={() => {
            handleOpenModal(itemForEditing);
            setActionModalVisible(false);
          }}
          style={{
            padding: '10px',
            fontSize: '14px',
            backgroundColor: 'yellow',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100px',
          }}
        >
          Edit
        </button>
        <button
          onClick={() => {
            setPermissionModalVisible(true);
          }}
          style={{
            padding: '10px',
            fontSize: '14px',
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100px',
          }}
        >
          Delete
        </button>
        <button
          onClick={() => setActionModalVisible(false)}
          style={{
            padding: '10px',
            fontSize: '14px',
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100px',
          }}
        >
          Cancel
        </button>
      </div>
      {permissionModalVisible && (
        <div
          style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
            width: '85%',
            textAlign: 'center',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
            Do you want to delete <span style={{ fontWeight: 'bold' }}>{itemForEditing.name}</span>?
          </h3>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              style={{
                padding: '10px',
                fontSize: '14px',
                backgroundColor: 'green',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '80px',
              }}
              onClick={() => {
                handleDelete(itemId);
                setPermissionModalVisible(false);
                setActionModalVisible(false);
              }}
            >
              Yes
            </button>
            <button
              style={{
                padding: '10px',
                fontSize: '14px',
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '80px',
              }}
              onClick={() => setPermissionModalVisible(false)}
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)}

    </div>
  );
}

export default App;
