# OneTick POS - Arabic POS System (RTL) with Orders, Reports, and Card Payment
<p align="center">
        <img src="https://github.com/abdmanassra/oneclick-pos-client/assets/40340485/6d8bdc82-0397-45f2-8eba-dd1ac233af43" alt="POS System" width="50%" height="35%" style="padding: 5px;">
        <br>
        <img src="https://github.com/abdmanassra/oneclick-pos-client/assets/40340485/90fd1479-d628-4935-b531-778059c9eff5" alt="POS System" width="200" height="130" style="padding: 5px;">
        <img src="https://github.com/abdmanassra/oneclick-pos-client/assets/40340485/d3734101-ba07-4fd6-a9dc-1d122eab0049" alt="POS System" width="200" height="130" style="padding: 5px;">
        <img src="https://github.com/abdmanassra/oneclick-pos-client/assets/40340485/8149ece7-20f8-4d04-bc94-7b2726f18225" alt="POS System" width="200" height="130" style="padding: 5px;">
        <img src="https://github.com/abdmanassra/oneclick-pos-client/assets/40340485/19347387-e22d-47a7-8fa7-1ec0d8a67bf0" alt="POS System" width="200" height="130" style="padding: 5px;">
</p>

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
