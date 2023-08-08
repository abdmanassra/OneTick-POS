# OneClick POS - Arabic POS System (RTL) with Orders, Reports, and Card Payment
<center><img src="https://github.com/abdmanassra/oneclick-pos-client/assets/40340485/719afaae-9596-4410-88fb-e81f2e2ed1ec" alt="POS System" width="450" height="275" style="background-color: black; padding: 5px;"></center>
<br />
<img src="https://github.com/abdmanassra/oneclick-pos-client/assets/40340485/d835539e-2306-4656-bed6-ad054448896d" alt="POS System" width="200" height="130" style="background-color: black; padding: 5px;">
<img src="https://github.com/abdmanassra/oneclick-pos-client/assets/40340485/e78b7418-01b2-4979-9388-8b08a2d842d2" alt="POS System" width="200" height="130" style="background-color: black; padding: 5px;">
<img src="https://github.com/abdmanassra/oneclick-pos-client/assets/40340485/1a0f19e2-faba-4571-9c5f-ccb79d280d6b" alt="POS System" width="200" height="130" style="background-color: black; padding: 5px;">
<img src="https://github.com/abdmanassra/oneclick-pos-client/assets/40340485/d3de0da7-f914-463b-8447-3b5d046233ce" alt="POS System" width="200" height="130" style="background-color: black; padding: 5px;">

## Overview

This repository contains a Point of Sale (POS) system developed using ElectronJs, NoSQL (Firebase), and NodeJS. The system is designed to provide a single-page application for both desktop and web platforms, with full support for Arabic (Right-to-Left) language layout.

The POS system offers the following features:
- **Orders:** Create and manage customer orders, add items, adjust quantities, and calculate totals.
- **Reports:** Generate sales reports, view transaction history, and track daily, monthly, and yearly sales.
- **Card Payment:** Securely process card payments using integrated payment gateways.

## Technologies Used

- **ElectronJs:** Used to create cross-platform desktop applications using web technologies.
- **NoSQL (Firebase):** Utilized as the backend database to store order information, user data, and transaction history.
- **NodeJS:** Backend runtime environment to handle server-side operations and communication with the database.

## Features

### Orders

The **Orders** section allows you to:
- Create new orders by selecting items from a product list.
- Adjust item quantities and remove items from the order.
- Calculate and display the total price for each order.
- Apply discounts or promotions if applicable.

### Reports

The **Reports** section provides:
- Visualizations of sales data over different time periods.
- Transaction history and details for each order.
- Insights into top-selling items and customer preferences.

### Card Payment

For secure payments:
- Integrated payment gateways enable customers to pay using credit or debit cards.
- Card information is encrypted and securely processed.

## Installation and Usage

1. Clone this repository to your local machine.
   ```sh
   git clone https://github.com/abdmanassra/oneclick-pos-client.git
2. Install the required dependencies.
     ```sh
   npm install
3. Run the application.
      ```sh
   npm start

## Deployment

### Desktop App

To deploy the POS system as a desktop application:

1. Build the desktop app.
   ```sh
   npm run build-desktop
   
### Web App

To deploy the POS system as a web application:

1. Build the web app:
   ```sh
   npm run build-web
2. Deploy the contents of the `dist/web` directory to a web server or hosting platform.

## Localization (RTL Support)

The application is designed with RTL layout support for Arabic language. This ensures a seamless user experience for Arabic-speaking users.

## Contributions

Contributions are welcome! If you have any improvements or feature suggestions, feel free to submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

---
By Abdalraheem Manassra(https://github.com/abdmanassra) and Razan Taha(https://github.com/RazanMahmoud) - Feel free to reach out with any questions or feedback., LinkedIn(https://www.linkedin.com/in/manassra94/)
