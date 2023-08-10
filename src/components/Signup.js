import React, { useEffect, useRef, useState } from "react";
import { Form, Button, Card, Container } from "react-bootstrap";
import "./Signup.css";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { useNavigate } from "react-router";


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

export default function Signup() {
   const navigate = useNavigate();
   const [ejamaatUniq, setIsEjamaatUniq] = useState(true);
   const mapContainer = useRef(null);
   const map = useRef(null);
   const [formData, setFormData] = useState({
      lngLat: [],
      ejamaat: "",
      profilePic: {},
      fullName: "",
      url: "",
      profession: "",
   });
   console.log(formData);
   function handleInputChange(e) {
      const inputType = e.target.type;
      const inputName = e.target.getAttribute("name");
      const inputValue =
         inputType === "file" ? e.target.files[0] : e.target.value;
      setFormData((prevData) => {
         return { ...prevData, [inputName]: inputValue };
      });
      setIsEjamaatUniq(true);
   }

   useEffect(() => {
      if (map.current) return; // initialize map only once
      map.current = new mapboxgl.Map({
         container: mapContainer.current,
         style: "mapbox://styles/mapbox/light-v11",
         center: [78.667743, 22.351115], // Replace with your desired center coordinates
         zoom: 1 // Set the initial zoom level
      });
      // You can also add a marker to the clicked location to indicate the selection
      let marker; // Variable to store the current marker

      // Function to add or update the marker when the user clicks on the map
      function addOrUpdateMarker(e) {
         // Get the longitude and latitude coordinates of the clicked location
         var lngLat = e.lngLat;
         var longitude = lngLat.lng;
         var latitude = lngLat.lat;
         setFormData((prevData) => {
            return { ...prevData, lngLat: [longitude, latitude] };
         });

         if (marker) {
            marker.remove();
         }

         // Add a new marker to the clicked location to indicate the selection
         marker = new mapboxgl.Marker().setLngLat(lngLat).addTo(map.current);
      }

      // Add an event listener to handle the map click event
      map.current.on("click", addOrUpdateMarker);
   }, []);

   async function handleSubmit(e) {
      e.preventDefault();
      const postFormData = new FormData();
      postFormData.append("ejamaat", formData.ejamaat);

      await fetch(`${process.env.REACT_APP_SERVER_URL}/ejamaat`, {
         method: "POST",
         body: postFormData,
      })
         .then(async (response) => {
            if (!response.ok) {
               setIsEjamaatUniq(false);
               return;
            } else {
               postFormData.append("lngLat", formData.lngLat);
               postFormData.append("profilePic", formData.profilePic);
               postFormData.append("fullName", formData.fullName);
               postFormData.append("url", formData.url);
               postFormData.append("profession", formData.profession);

               await fetch(`${process.env.REACT_APP_SERVER_URL}/bohras`, {
                  method: "POST",
                  body: postFormData,
               })
                  .then((response) => {
                     if (response.ok) {
                        //navigate("/dashboard");
                        navigate('/Dashboard', { state: { lngLat:formData.lngLat, ejamaat: formData.ejamaat }})
                     } else {
                        throw new Error("Image upload failed");
                     }
                  })
                  .catch((error) => {
                     console.log(error);
                     return;
                  });
            }
         })
         .catch((error) => {
            window.alert(error);
            return;
         });
   }

   return (
      <Container
         className="d-flex flex-column align-items-center justify-content-center mt-4"
      >
         <div className="w-100" style={{ maxWidth: "400px" }}>
            <Card className="rounded-4 bg-light">
               <Card.Body>
                  <h2 className="text-center mb-4">Connect</h2>
                  {!ejamaatUniq && (
                     <div className="alert alert-danger" role="alert">
                        This EJamaat ID already exists.
                     </div>
                  )}
                  <Form onSubmit={handleSubmit}>
                     <label htmlFor="ejamaatID" className="form-label content-label">
                        <span className="label-text">Ejamaat ID</span>
                        <div className="label-images">
                           <img
                              alt="Profile Picture"
                              height="25px"
                              src="https://www.svgrepo.com/show/108470/id-card.svg"
                           />
                        </div>
                     </label>
                     <input
                        type="text"
                        className="form-control mb-1"
                        id="ejamaatID"
                        placeholder="Example: 30926268"
                        required
                        pattern="\d{8}"
                        title="Please enter an 8-digit number"
                        name="ejamaat"
                        onChange={handleInputChange}
                        value={formData.ejamaat}
                     />

                     <label htmlFor="imageInput" className="form-label content-label">
                        <span className="label-text">Profile Picture</span>
                        <div className="label-images">
                           <img
                              alt="Profile Picture"
                              height="25px"
                              src="https://www.svgrepo.com/show/43426/profile.svg"
                           />
                        </div>
                     </label>
                     <input
                        type="file"
                        className="form-control"
                        id="imageInput"
                        accept="image/*"
                        name="profilePic"
                        onChange={handleInputChange}
                     ></input>

                     <label htmlFor="fullName" className="form-label content-label">
                        <span className="label-text">Full Name</span>
                        <div className="label-images">
                           <img
                              alt="Industry"
                              height="25px"
                              src="https://img.icons8.com/?size=512&id=11730&format=png"
                           />
                        </div>
                     </label>
                     <input
                        type="text"
                        className="form-control mb-1"
                        id="fullName"
                        placeholder="Example: Hussain Abuwala"
                        required
                        name="fullName"
                        onChange={handleInputChange}
                        value={formData.fullName}
                     />

                     <label htmlFor="other" className="form-label content-label">
                        <span className="label-text">Social Media Urls</span>
                        <img
                           alt="Linkedin"
                           height="25px"
                           src="https://img.icons8.com/?size=512&id=xuvGCOXi8Wyg&format=png"
                        />
                        <img
                           alt="Facebook"
                           height="25px"
                           src="https://img.icons8.com/?size=512&id=uLWV5A9vXIPu&format=png"
                        />
                        <img
                           alt="Instagram"
                           height="25px"
                           src="https://img.icons8.com/?size=512&id=Xy10Jcu1L2Su&format=png"
                        />
                        <img
                           alt="Twitter"
                           height="25px"
                           src="https://img.icons8.com/?size=512&id=13963&format=png"
                        />
                        <img
                           alt="Snapchat"
                           height="25px"
                           src="https://www.svgrepo.com/show/303130/snapchat-logo.svg"
                        />
                     </label>
                     <input
                        type="text"
                        className="form-control mb-1"
                        id="other"
                        placeholder="https://"
                        required
                        name="url"
                        onChange={handleInputChange}
                        value={formData.url}
                     />
                     <label htmlFor="profession" className="form-label content-label">
                        <span className="label-text">Industry</span>
                        <div className="label-images">
                           <img
                              alt="Industry"
                              height="25px"
                              src="https://img.icons8.com/?size=512&id=3708&format=png"
                           />
                        </div>
                     </label>
                     <select
                        className="form-select"
                        aria-label="Default select example"
                        id="profession"
                        name="profession"
                        required
                        onChange={handleInputChange}
                        defaultValue={formData.value}
                     >
                        <option value=""></option>
                        <option value="Accounting">Accounting</option>
                        <option value="Airlines/Aviation">
                           Airlines/Aviation
                        </option>
                        <option value="Alternative Dispute Resolution">
                           Alternative Dispute Resolution
                        </option>
                        <option value="Alternative Medicine">
                           Alternative Medicine
                        </option>
                        <option value="Animation">Animation</option>
                        <option value="Apparel/Fashion">Apparel/Fashion</option>
                        <option value="Architecture/Planning">
                           Architecture/Planning
                        </option>
                        <option value="Arts/Crafts">Arts/Crafts</option>
                        <option value="Automotive">Automotive</option>
                        <option value="Aviation/Aerospace">
                           Aviation/Aerospace
                        </option>
                        <option value="Banking/Mortgage">
                           Banking/Mortgage
                        </option>
                        <option value="Biotechnology/Greentech">
                           Biotechnology/Greentech
                        </option>
                        <option value="Broadcast Media">Broadcast Media</option>
                        <option value="Building Materials">
                           Building Materials
                        </option>
                        <option value="Business Supplies/Equipment">
                           Business Supplies/Equipment
                        </option>
                        <option value="Capital Markets/Hedge Fund/Private Equity">
                           Capital Markets/Hedge Fund/Private Equity
                        </option>
                        <option value="Chemicals">Chemicals</option>
                        <option value="Civic/Social Organization">
                           Civic/Social Organization
                        </option>
                        <option value="Civil Engineering">
                           Civil Engineering
                        </option>
                        <option value="Commercial Real Estate">
                           Commercial Real Estate
                        </option>
                        <option value="Computer Games">Computer Games</option>
                        <option value="Computer Hardware">
                           Computer Hardware
                        </option>
                        <option value="Computer Networking">
                           Computer Networking
                        </option>
                        <option value="Computer Software/Engineering">
                           Computer Software/Engineering
                        </option>
                        <option value="Computer/Network Security">
                           Computer/Network Security
                        </option>
                        <option value="Construction">Construction</option>
                        <option value="Consumer Electronics">
                           Consumer Electronics
                        </option>
                        <option value="Consumer Goods">Consumer Goods</option>
                        <option value="Consumer Services">
                           Consumer Services
                        </option>
                        <option value="Cosmetics">Cosmetics</option>
                        <option value="Dairy">Dairy</option>
                        <option value="Defense/Space">Defense/Space</option>
                        <option value="Design">Design</option>
                        <option value="E-Learning">E-Learning</option>
                        <option value="Education Management">
                           Education Management
                        </option>
                        <option value="Electrical/Electronic Manufacturing">
                           Electrical/Electronic Manufacturing
                        </option>
                        <option value="Entertainment/Movie Production">
                           Entertainment/Movie Production
                        </option>
                        <option value="Environmental Services">
                           Environmental Services
                        </option>
                        <option value="Events Services">Events Services</option>
                        <option value="Executive Office">
                           Executive Office
                        </option>
                        <option value="Facilities Services">
                           Facilities Services
                        </option>
                        <option value="Farming">Farming</option>
                        <option value="Financial Services">
                           Financial Services
                        </option>
                        <option value="Fine Art">Fine Art</option>
                        <option value="Fishery">Fishery</option>
                        <option value="Food Production">Food Production</option>
                        <option value="Food/Beverages">Food/Beverages</option>
                        <option value="Fundraising">Fundraising</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Gambling/Casinos">
                           Gambling/Casinos
                        </option>
                        <option value="Glass/Ceramics/Concrete">
                           Glass/Ceramics/Concrete
                        </option>
                        <option value="Government Administration">
                           Government Administration
                        </option>
                        <option value="Government Relations">
                           Government Relations
                        </option>
                        <option value="Graphic Design/Web Design">
                           Graphic Design/Web Design
                        </option>
                        <option value="Health/Fitness">Health/Fitness</option>
                        <option value="Higher Education/Acadamia">
                           Higher Education/Acadamia
                        </option>
                        <option value="Hospital/Health Care">
                           Hospital/Health Care
                        </option>
                        <option value="Hospitality">Hospitality</option>
                        <option value="Human Resources/HR">
                           Human Resources/HR
                        </option>
                        <option value="Import/Export">Import/Export</option>
                        <option value="Individual/Family Services">
                           Individual/Family Services
                        </option>
                        <option value="Industrial Automation">
                           Industrial Automation
                        </option>
                        <option value="Information Services">
                           Information Services
                        </option>
                        <option value="Information Technology/IT">
                           Information Technology/IT
                        </option>
                        <option value="Insurance">Insurance</option>
                        <option value="International Affairs">
                           International Affairs
                        </option>
                        <option value="International Trade/Development">
                           International Trade/Development
                        </option>
                        <option value="Internet">Internet</option>
                        <option value="Investment Banking/Venture">
                           Investment Banking/Venture
                        </option>
                        <option value="Investment Management/Hedge Fund/Private Equity">
                           Investment Management/Hedge Fund/Private Equity
                        </option>
                        <option value="Judiciary">Judiciary</option>
                        <option value="Law Enforcement">Law Enforcement</option>
                        <option value="Law Practice/Law Firms">
                           Law Practice/Law Firms
                        </option>
                        <option value="Legal Services">Legal Services</option>
                        <option value="Legislative Office">
                           Legislative Office
                        </option>
                        <option value="Leisure/Travel">Leisure/Travel</option>
                        <option value="Library">Library</option>
                        <option value="Logistics/Procurement">
                           Logistics/Procurement
                        </option>
                        <option value="Luxury Goods/Jewelry">
                           Luxury Goods/Jewelry
                        </option>
                        <option value="Machinery">Machinery</option>
                        <option value="Management Consulting">
                           Management Consulting
                        </option>
                        <option value="Maritime">Maritime</option>
                        <option value="Market Research">Market Research</option>
                        <option value="Marketing/Advertising/Sales">
                           Marketing/Advertising/Sales
                        </option>
                        <option value="Mechanical or Industrial Engineering">
                           Mechanical or Industrial Engineering
                        </option>
                        <option value="Media Production">
                           Media Production
                        </option>
                        <option value="Medical Equipment">
                           Medical Equipment
                        </option>
                        <option value="Medical Practice">
                           Medical Practice
                        </option>
                        <option value="Mental Health Care">
                           Mental Health Care
                        </option>
                        <option value="Military Industry">
                           Military Industry
                        </option>
                        <option value="Mining/Metals">Mining/Metals</option>
                        <option value="Motion Pictures/Film">
                           Motion Pictures/Film
                        </option>
                        <option value="Museums/Institutions">
                           Museums/Institutions
                        </option>
                        <option value="Music">Music</option>
                        <option value="Nanotechnology">Nanotechnology</option>
                        <option value="Newspapers/Journalism">
                           Newspapers/Journalism
                        </option>
                        <option value="Non-Profit/Volunteering">
                           Non-Profit/Volunteering
                        </option>
                        <option value="Oil/Energy/Solar/Greentech">
                           Oil/Energy/Solar/Greentech
                        </option>
                        <option value="Online Publishing">
                           Online Publishing
                        </option>
                        <option value="Other Industry">Other Industry</option>
                        <option value="Outsourcing/Offshoring">
                           Outsourcing/Offshoring
                        </option>
                        <option value="Package/Freight Delivery">
                           Package/Freight Delivery
                        </option>
                        <option value="Packaging/Containers">
                           Packaging/Containers
                        </option>
                        <option value="Paper/Forest Products">
                           Paper/Forest Products
                        </option>
                        <option value="Performing Arts">Performing Arts</option>
                        <option value="Pharmaceuticals">Pharmaceuticals</option>
                        <option value="Philanthropy">Philanthropy</option>
                        <option value="Photography">Photography</option>
                        <option value="Plastics">Plastics</option>
                        <option value="Political Organization">
                           Political Organization
                        </option>
                        <option value="Primary/Secondary Education">
                           Primary/Secondary Education
                        </option>
                        <option value="Printing">Printing</option>
                        <option value="Professional Training">
                           Professional Training
                        </option>
                        <option value="Program Development">
                           Program Development
                        </option>
                        <option value="Public Relations/PR">
                           Public Relations/PR
                        </option>
                        <option value="Public Safety">Public Safety</option>
                        <option value="Publishing Industry">
                           Publishing Industry
                        </option>
                        <option value="Railroad Manufacture">
                           Railroad Manufacture
                        </option>
                        <option value="Ranching">Ranching</option>
                        <option value="Real Estate/Mortgage">
                           Real Estate/Mortgage
                        </option>
                        <option value="Recreational Facilities/Services">
                           Recreational Facilities/Services
                        </option>
                        <option value="Religious Institutions">
                           Religious Institutions
                        </option>
                        <option value="Renewables/Environment">
                           Renewables/Environment
                        </option>
                        <option value="Research Industry">
                           Research Industry
                        </option>
                        <option value="Restaurants">Restaurants</option>
                        <option value="Retail Industry">Retail Industry</option>
                        <option value="Security/Investigations">
                           Security/Investigations
                        </option>
                        <option value="Semiconductors">Semiconductors</option>
                        <option value="Shipbuilding">Shipbuilding</option>
                        <option value="Sporting Goods">Sporting Goods</option>
                        <option value="Sports">Sports</option>
                        <option value="Staffing/Recruiting">
                           Staffing/Recruiting
                        </option>
                        <option value="Supermarkets">Supermarkets</option>
                        <option value="Telecommunications">
                           Telecommunications
                        </option>
                        <option value="Textiles">Textiles</option>
                        <option value="Think Tanks">Think Tanks</option>
                        <option value="Tobacco">Tobacco</option>
                        <option value="Translation/Localization">
                           Translation/Localization
                        </option>
                        <option value="Transportation">Transportation</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Venture Capital/VC">
                           Venture Capital/VC
                        </option>
                        <option value="Veterinary">Veterinary</option>
                        <option value="Warehousing">Warehousing</option>
                        <option value="Wholesale">Wholesale</option>
                        <option value="Wine/Spirits">Wine/Spirits</option>
                        <option value="Wireless">Wireless</option>
                        <option value="Writing/Editing">Writing/Editing</option>
                     </select>
                     <label className="form-label content-label mt-2">
                        <span className="label-text">Select Location On Map</span>
                        <div className="label-images">
                           <img
                              alt="Industry"
                              height="25px"
                              src="https://img.icons8.com/?size=512&id=3723&format=png"
                           />
                        </div>
                     </label>
                     {formData.lngLat.length !== 0 && (
                        <Button className="w-100 mt-3 btn btn-secondary" type="submit">
                           Submit
                        </Button>
                     )}
                  </Form>
               </Card.Body>
            </Card>
         </div>
         <div className="location-div mt-4">
            <div ref={mapContainer} className="location-map-container"></div>
         </div>
      </Container>
   );
}
