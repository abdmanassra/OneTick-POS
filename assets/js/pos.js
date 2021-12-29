let cart = [];
let index = 0;
let allUsers = [];
let allProducts = [];
let allCategories = [];
let allTransactions = [];
let sold = [];
let state = [];
let sold_items = [];
let item;
let auth;
let holdOrder = 0;
let vat = 0;
let perms = null;
let deleteId = 0;
let paymentType = 0;
let receipt = '';
let totalVat = 0;
let subTotal = 0;
let method = '';
let order_index = 0;
let user_index = 0;
let product_index = 0;
let transaction_index;
let host = 'localhost';
let path = require('path');
let port = '8001';
let notiflix = require('notiflix');
let moment = require('moment');
let Swal = require('sweetalert2');
let { ipcRenderer } = require('electron');
let dotInterval = setInterval(function () { $(".dot").text('.') }, 3000);
let Store = require('electron-store');
const remote = require('electron').remote;
const { PosPrinter } = remote.require("electron-pos-printer");// printer lib
const { qz } = remote.require("qz-tray");
const app = remote.app;
let img_path = app.getPath('appData') + '/POS/uploads/';
let api = 'http://' + host + ':' + port + '/api/';
let btoa = require('btoa');
let jsPDF = require('jspdf');
let html2canvas = require('html2canvas');
let JsBarcode = require('jsbarcode');
let macaddress = require('macaddress');
let categories = [];
let holdOrderList = [];
let customerOrderList = [];
let ownUserEdit = null;
let totalPrice = 0;
let orderTotal = 0;
let auth_error = 'اسم المستخدم او كلمة المرور خاطئة';
let auth_empty = 'الرجاء ادخال اسم المستخدم وكلمة المرور';
let holdOrderlocation = $("#randerHoldOrders");
let customerOrderLocation = $("#randerCustomerOrders");
let storage = new Store();
let settings;
let platform;
let user = {};
let start = moment().startOf('month');
let end = moment();
let start_date = moment(start).toDate();
let end_date = moment(end).toDate();
let by_till = 0;
let by_user = 0;
let by_status = 1;
// let Settings = {}
//var se =1;



/*************************************** Printers Code ************************************/
let webContents = remote.getCurrentWebContents();
let printers = webContents.getPrinters(); //list the printers
$('#printer').html(`<option value="0">Select</option>`);
printers.forEach((printer, i) => {
    $('#printer').append(`<option value="${printer.name}">${printer.name}</option>`);
});


/*************************************** Printers Code ************************************/

$(function () {

    function cb(start, end) {
        $('#reportrange span').html(start.format('MMMM D, YYYY') + '  -  ' + end.format('MMMM D, YYYY'));
    }

    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        autoApply: true,
        timePicker: true,
        timePicker24Hour: true,
        timePickerIncrement: 10,
        timePickerSeconds: true,
        // minDate: '',
        ranges: {
            'Today': [moment().startOf('day'), moment()],
            'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
            'Last 7 Days': [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
            'Last 30 Days': [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'This Month': [moment().startOf('month'), moment()],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

    cb(start, end);

});


$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};


auth = storage.get('auth');
user = storage.get('user');


if (auth == undefined) {
    $.get(api + 'users/check/', function (data) { });
    $("#loading").show();
    authenticate();

} else {

    $('#loading').show();

    setTimeout(function () {
        $('#loading').hide();
    }, 2000);

    platform = storage.get('settings');

    if (platform != undefined) {

        if (platform.app == 'Network Point of Sale Terminal') {
            api = 'http://' + platform.ip + ':' + port + '/api/';
            perms = true;
        }
    }

    $.get(api + 'users/user/' + user._id, function (data) {
        user = data;
        $('#loggedin-user').text(user.fullname);
    });


    $.get(api + 'settings/get', function (data) {
        settings = data.settings;
    });


    $.get(api + 'users/all', function (users) {
        allUsers = [...users];
    });



    $(document).ready(function () {
        $("#contractEndSoonMessage").hide();

        $(".loading").hide();

        loadCategories();
        loadProducts();
        loadCustomers();
        // loadSettings();

        if (settings && settings.symbol) {
            $("#price_curr, #payment_curr, #change_curr").text(settings.symbol);
        }


        setTimeout(function () {
            if (settings == undefined && auth != undefined) {
                $('#settingsModal').modal('show');
            }
            else {
                vat = parseFloat(settings.percentage);
                $("#taxInfo").text(settings.charge_tax ? vat : 0);
            }

        }, 1500);



        $("#settingsModal").on("hide.bs.modal", function () {

            setTimeout(function () {
                if (settings == undefined && auth != undefined) {
                    $('#settingsModal').modal('show');
                }
            }, 1000);

        });


        if (0 == user.perm_products) { $(".p_one").hide() };
        if (0 == user.perm_categories) { $(".p_two").hide() };
        if (0 == user.perm_transactions) { $(".p_three").hide() };
        if (0 == user.perm_users) { $(".p_four").hide() };
        if (0 == user.perm_settings) { $(".p_five").hide() };


        function loadSettings(){

            $.get(api + 'settings/get', function (data) {

                
    
                Settings =data.settings;
                console.log(Settings);
                });

        }
                      

        setInterval(function(){checkCustomerStatus();}, 15000);
        
        function checkCustomerStatus(){
            $.ajax({
                url: api + 'users/checkStatus',
                type: 'GET',
                error: function() {
                    Swal.fire(
                        'لقد انتهى ترخيص البرنامج',
                        "يرجى التواصل مع فريق التطوير لتجديد النسخة لديك",
                        'error'
                    ).then(function() {
                    $.get(api + 'users/logout/' + user._id, function (data) {
                    storage.delete('auth');
                    storage.delete('user');
                    ipcRenderer.send('app-reload', '');
                    });
                    });
                },
                success: function(data) {
                    var date = new Date().toDateString();
                    if (daysBetween(date, data) < 15) {
                        $( ".contractEndSoonMessage" ).append( $( "<div id='contractEndSoonMessageTemp'> " + 
                                                    "<div class='alert alert-warning alert-dismissible' role='alert'> " + 
                                                    " سوف ينتهي ترخيص البرنامج خلال <span id='numberOfDays'>"+
                                                     daysBetween(date, data) + 
                                                    "</span>ايام" + 
                                                    " يرجى التواصل مع فريق التطوير لتجديد ترخيص البرنامج  </div></div>" ) );

                        window.setTimeout(function() {
                            $("#contractEndSoonMessageTemp").fadeTo(1000, 0).slideUp(1000, function(){
                                $(this).remove(); 
                            });
                        }, 4500);
                    }
                }
            });
        }

        function treatAsUTC(date) {
            var result = new Date(date);
            result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
            return result;
        }
        
        function daysBetween(startDate, endDate) {
            var millisecondsPerDay = 24 * 60 * 60 * 1000;
            return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
        }

        function loadProducts() {

            var Settings = {};          
            $.get(api + 'settings/get', function (data) {



                Settings =data.settings;
                console.log(Settings);
                });

            $.get(api + 'inventory/products', function (data) {

                data.forEach(item => {
                    item.price = parseFloat(item.price).toFixed(2);
                });

                allProducts = [...data];
                loadProductList();
                let delay = 0;
                // allProducts.forEach(product => {

                //     let todayDate = Date.now();
                //     let expDate = moment(product.expirationDate, "DD-MM-YYYY");
                //     const diffTime = Math.abs(expDate - todayDate);
                //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                //     if (diffDays <= 7 && diffDays > 2) {
                //         notiflix.Notify.Init({
                //             position: "right-bottom",
                //             cssAnimationDuration: 600,
                //             timeout: 4000 + delay,
                //             messageMaxLength: 150,
                //             cssAnimationStyle: "from-bottom"
                //         });
                //         notiflix.Notify.Warning(`${product.name} has only ${diffDays} day(s) left to expiry`);

                //     }
                //     else if (diffDays <= 2) {
                //         notiflix.Notify.Init({
                //             position: "right-bottom",
                //             cssAnimationDuration: 600,
                //             timeout: 8000 + delay * 2,
                //             messageMaxLength: 150,
                //             cssAnimationStyle: "from-bottom"
                //         });
                //         notiflix.Notify.Failure(`${product.name} has only ${diffDays} day(s) left to expiry`);
                //     }
                //     delay += 100;



                // })

                $('#parent').text('');


                $('#categories').html(`<button type="button" id="all" class="btn btn-categories btn-white waves-effect waves-light">الكل</button> `);

                data.forEach(item => {

                    if (!categories.includes(item.category)) {
                        categories.push(item.category);
                    }

                    console.log(Settings);

                    let item_info  = '';
                    if(Settings.view == 1){
                         item_info = `<div class="col-lg-2 box ${item.category}"
                        onclick="$(this).addToCart(${item._id})">
                    <div class="widget-panel widget-style-2 ">                    
                    <div id="image"><img src="${item.img == "" ? "./assets/images/default.jpg" : img_path + item.img}" id="product_img" alt=""></div>                    
                                <div class="text-muted m-t-5 text-center">
                                <div class="name" id="product_name">${item.name}</div> 
                                <sp class="text-success text-center"><b data-plugin="counterup">${item.price + " " + settings.symbol}</b> </sp>
                    </div>
                </div>`;
                    }
                        else{
                             item_info = `<div class="col-lg-2 box ${item.category}"
                            onclick="$(this).addToCart(${item._id})">
                        <div class="widget-panel widget-style-2 ">                    
                        <div id="image"><img src="${item.img == "" ? "./assets/images/default.jpg" : img_path + item.img}" id="product_img" alt=""></div>                    
                    </div>`;
                        }
                    $('#parent').append(item_info);
                });

                categories.forEach(category => {

                    let c = allCategories.filter(function (ctg) {
                        return ctg._id == category;
                    })

                    $('#categories').append(`<button type="button" id="${category}" class="btn btn-categories btn-white waves-effect waves-light">${c.length > 0 ? c[0].name : ''}</button> `);
                });
                //possible alert position 
            });

        }

        function loadCategories() {
            $.get(api + 'categories/all', function (data) {
                allCategories = data;
                loadCategoryList();
                $('#category').html(`<option value="0">Select</option>`);
                allCategories.forEach(category => {
                    $('#category').append(`<option value="${category._id}">${category.name}</option>`);
                });
            });
        }


        function loadCustomers() {

            $.get(api + 'customers/all', function (customers) {

                $('#customer').html(`<option value="0" selected="selected">Walk in customer</option>`);

                customers.forEach(cust => {

                    let customer = `<option value='{"id": ${cust._id}, "name": "${cust.name}"}'>${cust.name}</option>`;
                    $('#customer').append(customer);
                });

                //  $('#customer').chosen();

            });

        }


        $.fn.addToCart = function (id) {
            $.get(api + 'inventory/product/' + id, function (data) {
                $(this).addProductToCart(data);
            });
        };


        // function barcodeSearch(e) {

        //     e.preventDefault();
        //     $("#basic-addon2").empty();
        //     $("#basic-addon2").append(
        //         $('<i>', { class: 'fa fa-spinner fa-spin' })
        //     );

        //     let req = {
        //         skuCode: $("#skuCode").val()
        //     }

        //     $.ajax({
        //         url: api + 'inventory/product/sku',
        //         type: 'POST',
        //         data: JSON.stringify(req),
        //         contentType: 'application/json; charset=utf-8',
        //         cache: false,
        //         processData: false,
        //         success: function (data) {
        //             if (data._id != undefined && data.quantity >= 1) {
        //                 $(this).addProductToCart(data);
        //                 $("#searchBarCode").get(0).reset();
        //                 $("#basic-addon2").empty();
        //                 $("#basic-addon2").append(
        //                     $('<i>', { class: 'glyphicon glyphicon-ok' })
        //                 )
        //             }
        //             else if (data.quantity < 1) {
        //                 Swal.fire(
        //                     'Out of stock!',
        //                     'This item is currently unavailable',
        //                     'info'
        //                 );
        //             }
        //             else {

        //                 Swal.fire(
        //                     'Not Found!',
        //                     '<b>' + $("#skuCode").val() + '</b> is not a valid barcode!',
        //                     'warning'
        //                 );

        //                 $("#searchBarCode").get(0).reset();
        //                 $("#basic-addon2").empty();
        //                 $("#basic-addon2").append(
        //                     $('<i>', { class: 'glyphicon glyphicon-ok' })
        //                 )
        //             }

        //         }, error: function (data) {
        //             if (data.status === 422) {
        //                 $(this).showValidationError(data);
        //                 $("#basic-addon2").append(
        //                     $('<i>', { class: 'glyphicon glyphicon-remove' })
        //                 )
        //             }
        //             else if (data.status === 404) {
        //                 $("#basic-addon2").empty();
        //                 $("#basic-addon2").append(
        //                     $('<i>', { class: 'glyphicon glyphicon-remove' })
        //                 )
        //             }
        //             else {
        //                 $(this).showServerError();
        //                 $("#basic-addon2").empty();
        //                 $("#basic-addon2").append(
        //                     $('<i>', { class: 'glyphicon glyphicon-warning-sign' })
        //                 )
        //             }
        //         }
        //     });

        // }


        // $("#searchBarCode").on('submit', function (e) {
        //     barcodeSearch(e);
        // });



        // $('body').on('click', '#jq-keyboard button', function (e) {
        //     let pressed = $(this)[0].className.split(" ");
        //     if ($("#skuCode").val() != "" && pressed[2] == "enter") {
        //         barcodeSearch(e);
        //     }
        // });



        $.fn.addProductToCart = function (data) {
            item = {
                id: data._id,
                product_name: data.name,
                price: data.price,
                quantity: 1
            };

            if ($(this).isExist(item)) {
                $(this).qtIncrement(index);
            } else {
                cart.push(item);
                $(this).renderTable(cart)
            }
        }


        $.fn.isExist = function (data) {
            let toReturn = false;
            $.each(cart, function (index, value) {
                if (value.id == data.id) {
                    $(this).setIndex(index);
                    toReturn = true;
                }
            });
            return toReturn;
        }


        $.fn.setIndex = function (value) {
            index = value;
        }

        $.fn.closeCash = function(){


            Swal.fire({
                title: 'هل انت متأكد؟',
                text: "سوف يتم حذف جميع الطلبيات",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'اغلاق الكاش'
            }).then((result) => {

                if (result.value) {

                    $.post(api + 'delete/', function (data) {
                        console.log(data);
                    });

                    Swal.fire(
                        'تم الحذف!',
                        'تم حذف جميع الاصناف',
                        'success'
                    )
                }
            });
        }


        $.fn.calculateCart = function () {
            let total = 0;
            let ctotalProfit = 0;
            let grossTotal;
            $('#total').text(cart.length);
            $.each(cart, function (index, data) {
                total += data.quantity * data.price;
                // ctotalProfit += data.quantity * data.profit;
            });

            //total = total - $("#inputDiscount").val();
            $('#price').text(total.toFixed(2) + " " + settings.symbol);

            subTotal = total;

            if ($("#inputDiscount").val() >= total) {
                $("#inputDiscount").val(0);
            }

            if (settings.charge_tax) {
                totalVat = ((total * vat) / 100);
                grossTotal = total + totalVat
            }

            else {
                grossTotal = total;
            }

            orderTotal = total;

            // $("#gross_price").text(grossTotal.toFixed(2) + " " + settings.symbol);
            $("#payablePrice").val(total);
        };



        $.fn.renderTable = function (cartList) {
            $('#cartTable > tbody').empty();
            $(this).calculateCart();
            $.each(cartList, function (index, data) {
                $('#cartTable > tbody').append(
                    $('<tr>').append(
                        $('<td>', { text: index + 1 }),
                        $('<td>', { text: data.product_name }),
                        $('<td>').append(
                            $('<div>', { class: 'input-group' }).append(
                                $('<div>', { class: 'input-group-btn btn-xs' }).append(
                                    $('<button>', {
                                        class: 'btn btn-default btn-xs',
                                        onclick: '$(this).qtDecrement(' + index + ')'
                                    }).append(
                                        $('<i>', { class: 'fa fa-minus' })
                                    )
                                ),
                                $('<input>', {
                                    class: 'form-control',
                                    type: 'text',
                                    value: data.quantity,
                                    onInput: '$(this).qtInput(' + index + ')'
                                }),
                                $('<div>', { class: 'input-group-btn btn-xs' }).append(
                                    $('<button>', {
                                        class: 'btn btn-default btn-xs',
                                        onclick: '$(this).qtIncrement(' + index + ')'
                                    }).append(
                                        $('<i>', { class: 'fa fa-plus' })
                                    )
                                )
                            )
                        ),
                        $('<td>', { text: (data.price * data.quantity).toFixed(2) }), //+ settings.symbol 
                        $('<td>').append(
                            $('<button>', {
                                class: 'btn btn-danger btn-xs',
                                onclick: '$(this).deleteFromCart(' + index + ')'
                            }).append(
                                $('<i>', { class: 'fa fa-times' })
                            )
                        )
                    )
                )
            })
        };


        $.fn.deleteFromCart = function (index) {
            cart.splice(index, 1);
            $(this).renderTable(cart);

        }


        $.fn.qtIncrement = function (i) {

            item = cart[i];

            let product = allProducts.filter(function (selected) {
                return selected._id == parseInt(item.id);
            });

            item.quantity += 1;
            $(this).renderTable(cart);

        }


        $.fn.qtDecrement = function (i) {
            if (item.quantity > 1) {
                item = cart[i];
                item.quantity -= 1;
                $(this).renderTable(cart);
            }
        }


        $.fn.qtInput = function (i) {
            item = cart[i];
            item.quantity = $(this).val();
            $(this).renderTable(cart);
        }


        $.fn.cancelOrder = function () {

            if (cart.length > 0) {
                Swal.fire({
                    title: 'هل انت متأكد؟',
                    text: "سوف يتم حذف جميع الاصناف",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'حذف الاصناف'
                }).then((result) => {

                    if (result.value) {

                        cart = [];
                        $(this).renderTable(cart);
                        holdOrder = 0;

                        Swal.fire(
                            'تم الحذف!',
                            'تم حذف جميع الاصناف',
                            'success'
                        )
                    }
                });
            }

        }


        $("#payButton").on('click', function () {
            if (cart.length != 0) {
                $("#paymentModel").modal('toggle');
            } else {
                Swal.fire(
                    'مهلا!',
                    'لا يوجد طلب لدفعه',
                    'warning'
                );
            }


        });


        $("#hold").on('click', function () {

            if (cart.length != 0) {

                $("#dueModal").modal('toggle');
            } else {
                Swal.fire(
                    'مهلا!',
                    'لا يوجد طلب لتعليقه!',
                    'warning'
                );
            }
        });


        function printJobComplete() {
            alert("print job complete");
        }

        let printerName;
        let widthPage;
        const print_data = [
        //     {
        //       type: 'image',                                       
        //       path: 'assets/images/untitled.png',     // file path
        //       position: 'center',                                  // position of image: 'left' | 'center' | 'right'
        //       width: 60,                                           // width of image in px; default: auto
        //       height: 60,                                          // width of image in px; default: 50 or '50px'
        //    },
           {
            type: 'table',
            // style the table
            style: 'border: 1px solid #ddd',
            // list of the columns to be rendered in the table header
            tableHeader: ['Price', 'Qty', 'Item'],
            // multi dimensional array depicting the rows and columns of the table body
            tableBody: [
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],
                [2, 2,'وجبة مرح'],

                ['subtotal',':',2],
                ['Discount',':',2],

            ],
            // list of columns to be rendered in the table footer
            // custom style for the table header
            tableHeaderStyle: 'color: #000000;',
            // custom style for the table body
            tableBodyStyle: 'color:#000000;border: 0.5px solid #000; font-weight:bold;',
            // custom style for the table footer
            tableFooterStyle: 'color: #000000;',
         }
        ];
        $.fn.submitDueOrder = function (status) {

            let items = "";
            let payment = 0;
            widthPage = 300;
            printerName = "Microsoft Print to PDF";
            const options = {
                preview: false, // Preview in window or print
                width: widthPage, //  width of content body
                margin: "0 0 0 0", // margin of content body
                copies: 1, // Number of copies to print
                printerName: printerName, // printerName: string, check it at webContent.getPrinters()
                timeOutPerLine: 400,
                silent: true,
              };

            if (printerName && widthPage) {
                PosPrinter.print(print_data, options)
                  .then(() => {})
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                alert("Select the printer and the width");
              }

            cart.forEach(item => {

                items += "<tr><td>" + item.product_name + "</td><td>" + item.quantity + "</td><td>" + parseFloat(item.price).toFixed(2) + " " + settings.symbol + "</td></tr>";

            });
    

            let currentTime = new Date(moment());

            //let discount = $("#inputDiscount").val();
            let discount = 0;
            let customer = JSON.parse($("#customer").val());
            let date = moment(currentTime).format("YYYY-MM-DD HH:mm:ss");
            let paid = $("#payment").val() == "" ? "" : parseFloat($("#payment").val()).toFixed(2);
            let change = $("#change").text() == "" ? "" : parseFloat($("#change").text()).toFixed(2);
            let refNumber = $("#refNumber").val();
            let orderNumber = holdOrder;
            let type = "";
            let tax_row = "";


            switch (paymentType) {

                case 1: type = "Cheque";
                    break;

                case 2: type = "Card";
                    break;

                default: type = "Cash";

            }


            if (paid != "") {
                payment = `<tr>
                        <td>Paid</td>
                        <td>:</td>
                        <td>${paid + " " + settings.symbol}</td>
                    </tr>
                    <tr>
                        <td>Change</td>
                        <td>:</td>
                        <td>${Math.abs(change).toFixed(2) + " " + settings.symbol}</td>
                    </tr>
                    <tr>
                        <td>Method</td>
                        <td>:</td>
                        <td>${type}</td>
                    </tr>`
            }



            if (settings.charge_tax) {
                tax_row = `<tr>
                    <td>Vat(${settings.percentage})% </td>
                    <td>:</td>
                    <td>${parseFloat(totalVat).toFixed(2)} ${settings.symbol}</td>
                </tr>`;
            }



            if (status == 0) {

                if ($("#customer").val() == 0 && $("#refNumber").val() == "") {
                    Swal.fire(
                        'المرجع اجباري',
                        'يجب عليك اضافة مرجع لتعليق الطلب',
                        'warning'
                    )

                    return;
                }
            }


            $(".loading").show();


            if (holdOrder != 0) {

                orderNumber = holdOrder;
                method = 'PUT'
            }
            else {
                orderNumber = Math.floor(Date.now() / 1000);
                method = 'POST'
            }


            receipt = `<div style="font-size: 10px;">                            
        <p style="text-align: center;">
        ${settings.img == "" ? settings.img : '<img style="max-width: 50px;max-width: 100px;" src ="' + img_path + settings.img + '" /><br>'}
            <span style="font-size: 22px;">${settings.store}</span> <br>
            ${settings.address_one} <br>
            ${settings.address_two} <br>
            ${settings.contact != '' ? 'Tel: ' + settings.contact + '<br>' : ''} 
            ${settings.tax != '' ? 'Vat No: ' + settings.tax + '<br>' : ''} 
        </p>
        <hr>
        <left>
            <p>
            Order No : ${orderNumber} <br>
            Ref No : ${refNumber == "" ? orderNumber : refNumber} <br>
            Customer : ${customer == 0 ? 'Walk in customer' : customer.name} <br>
            Cashier : ${user.fullname} <br>
            Date : ${date}<br>
            </p>

        </left>
        <hr>
        <table width="100%">
            <thead style="text-align: left;">
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
            </tr>
            </thead>
            <tbody>
            ${items}                
     
            <tr>                        
                <td><b>Subtotal</b></td>
                <td>:</td>
                <td><b>${subTotal.toFixed(2)} ${settings.symbol}</b></td>
            </tr>
            <tr>
                <td>Discount</td>
                <td>:</td>
                <td>${discount > 0 ? settings.symbol + parseFloat(discount).toFixed(2) : ''}</td>
            </tr>
            
            ${tax_row}
        
            <tr>
                <td><h3>Total</h3></td>
                <td><h3>:</h3></td>
                <td>
                    <h3>${parseFloat(orderTotal).toFixed(2)} ${settings.symbol}</h3>
                </td>
            </tr>
            ${payment == 0 ? '' : payment}
            </tbody>
            </table>
            <br>
            <hr>
            <br>
            <p style="text-align: center;">
                ONE TICK System - 0598986474
             </p>
            </div>`;


            if (status == 3) {
                if (cart.length > 0) {

                    printJS({ printable: receipt, type: 'raw-html' });

                    $(".loading").hide();
                    return;

                }
                else {

                    $(".loading").hide();
                    return;
                }
            }


            let data = {
                order: orderNumber,
                ref_number: refNumber,
                discount: discount,
                customer: customer,
                status: status,
                subtotal: parseFloat(subTotal).toFixed(2),
                tax: totalVat,
                order_type: 1,
                items: cart,
                date: currentTime,
                payment_type: paymentType,
                payment_info: $("#paymentInfo").val(),
                total: orderTotal,
                paid: paid,
                change: change,
                _id: orderNumber,
                till: platform.till,
                mac: platform.mac,
                user: user.fullname,
                user_id: user._id
            }


            $.ajax({
                url: api + 'new',
                type: method,
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                cache: false,
                processData: false,
                success: function (data) {

                    cart = [];
                    $('#viewTransaction').html('');
                    $('#viewTransaction').html(receipt);
                    $('#orderModal').modal('show');
                    loadProducts();
                    loadCustomers();
                    $(".loading").hide();
                    $("#dueModal").modal('hide');
                    $("#paymentModel").modal('hide');
                    $(this).getHoldOrders();
                    $(this).getCustomerOrders();
                    $(this).renderTable(cart);

                }, error: function (data) {
                    $(".loading").hide();
                    $("#dueModal").modal('toggle');
                    swal("Something went wrong!", 'Please refresh this page and try again');

                }
            });

            $("#refNumber").val('');
            $("#change").text('');
            $("#payment").val('');

        }


        $.get(api + 'on-hold', function (data) {
            holdOrderList = data;
            holdOrderlocation.empty();
            clearInterval(dotInterval);
            $(this).randerHoldOrders(holdOrderList, holdOrderlocation, 1);
        });


        $.fn.getHoldOrders = function () {
            $.get(api + 'on-hold', function (data) {
                holdOrderList = data;
                clearInterval(dotInterval);
                holdOrderlocation.empty();
                $(this).randerHoldOrders(holdOrderList, holdOrderlocation, 1);
            });
        };


        $.fn.randerHoldOrders = function (data, renderLocation, orderType) {
            $.each(data, function (index, order) {
                $(this).calculatePrice(order);
                renderLocation.append(
                    $('<div>', { class: orderType == 1 ? 'col-md-3 order' : 'col-md-3 customer-order' }).append(
                        $('<a>').append(
                            $('<div>', { class: 'card-box order-box text-center' }).append(
                                $('<p>').append(
                                    $('<b>', { text: 'المرجع :' }),
                                    $('<span>', { text: order.ref_number, class: 'ref_number' }),
                                    // $('<br>'),
                                    // $('<b>', { text: 'السعر :' }),
                                    // $('<span>', { text: order.total, class: "label label-info", style: 'font-size:14px;' }),
                                    // $('<br>'),
                                    // $('<b>', { text: 'عدد الاصناف :' }),
                                    // $('<span>', { text: order.items.length }),
                                    $('<br>'),
                                    // $('<b>', { text: 'الزبون :' }),
                                    // $('<span>', { text: order.customer != 0 ? order.customer.name : 'Walk in customer', class: 'customer_name' })
                                ),
                                $('<button>', { class: 'btn btn-danger del', onclick: '$(this).deleteOrder(' + index + ',' + orderType + ')' }).append(
                                    $('<i>', { class: 'fa fa-trash' })
                                ),

                                $('<button>', { class: 'btn btn-default', onclick: '$(this).orderDetails(' + index + ',' + orderType + ')' }).append(
                                    $('<span>', { class: 'fa fa-shopping-basket' })
                                )
                            )
                        )
                    )
                )
            })
        }


        $.fn.calculatePrice = function (data) {
            totalPrice = 0;
            $.each(data.products, function (index, product) {
                totalPrice += product.price * product.quantity;
            })

            let vat = (totalPrice * data.vat) / 100;
            totalPrice = ((totalPrice + vat) - data.discount).toFixed(0);

            return totalPrice;
        };


        $.fn.orderDetails = function (index, orderType) {

            $('#refNumber').val('');

            if (orderType == 1) {

                $('#refNumber').val(holdOrderList[index].ref_number);

                $("#customer option:selected").removeAttr('selected');

                $("#customer option").filter(function () {
                    return $(this).text() == "Walk in customer";
                }).prop("selected", true);

                holdOrder = holdOrderList[index]._id;
                cart = [];
                $.each(holdOrderList[index].items, function (index, product) {
                    item = {
                        id: product.id,
                        product_name: product.product_name,
                        sku: product.sku,
                        price: product.price,
                        quantity: product.quantity
                    };
                    cart.push(item);
                })
            } else if (orderType == 2) {

                $('#refNumber').val('');

                $("#customer option:selected").removeAttr('selected');

                $("#customer option").filter(function () {
                    return $(this).text() == customerOrderList[index].customer.name;
                }).prop("selected", true);


                holdOrder = customerOrderList[index]._id;
                cart = [];
                $.each(customerOrderList[index].items, function (index, product) {
                    item = {
                        id: product.id,
                        product_name: product.product_name,
                        sku: product.sku,
                        price: product.price,
                        quantity: product.quantity
                    };
                    cart.push(item);
                })
            }
            $(this).renderTable(cart);
            $("#holdOrdersModal").modal('hide');
            $("#customerModal").modal('hide');
        }


        $.fn.deleteOrder = function (index, type) {

            switch (type) {
                case 1: deleteId = holdOrderList[index]._id;
                    break;
                case 2: deleteId = customerOrderList[index]._id;
            }

            let data = {
                orderId: deleteId,
            }

            Swal.fire({
                title: "حذف الفاتورة؟",
                text: "سوف يتم حذف الفاتورة, هل انت متأكد من ذلك؟",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'حذف'
            }).then((result) => {

                if (result.value) {

                    $.ajax({
                        url: api + 'delete',
                        type: 'POST',
                        data: JSON.stringify(data),
                        contentType: 'application/json; charset=utf-8',
                        cache: false,
                        success: function (data) {

                            $(this).getHoldOrders();
                            $(this).getCustomerOrders();

                            Swal.fire(
                                'تم الحذف!',
                                'لقد قمت بحذف الفاتورة!',
                                'success'
                            )

                        }, error: function (data) {
                            $(".loading").hide();

                        }
                    });
                }
            });
        }



        $.fn.getCustomerOrders = function () {
            $.get(api + 'customer-orders', function (data) {
                clearInterval(dotInterval);
                customerOrderList = data;
                customerOrderLocation.empty();
                $(this).randerHoldOrders(customerOrderList, customerOrderLocation, 2);
            });
        }



        $('#saveCustomer').on('submit', function (e) {

            e.preventDefault();

            let custData = {
                _id: Math.floor(Date.now() / 1000),
                name: $('#userName').val(),
                phone: $('#phoneNumber').val(),
                email: $('#emailAddress').val(),
                address: $('#userAddress').val()
            }

            $.ajax({
                url: api + 'customers/customer',
                type: 'POST',
                data: JSON.stringify(custData),
                contentType: 'application/json; charset=utf-8',
                cache: false,
                processData: false,
                success: function (data) {
                    $("#newCustomer").modal('hide');
                    Swal.fire("Customer added!", "Customer added successfully!", "success");
                    $("#customer option:selected").removeAttr('selected');
                    $('#customer').append(
                        $('<option>', { text: custData.name, value: `{"id": ${custData._id}, "name": ${custData.name}}`, selected: 'selected' })
                    );

                    $('#customer').val(`{"id": ${custData._id}, "name": ${custData.name}}`).trigger('chosen:updated');

                }, error: function (data) {
                    $("#newCustomer").modal('hide');
                    Swal.fire('Error', 'يرجى المحاولة مرة اخرى', 'error')
                }
            })
        })


        $("#confirmPayment").hide();

        $("#cardInfo").hide();

        $("#payment").on('input', function () {
            $(this).calculateChange();
        });


        $("#confirmPayment").on('click', function () {
            if ($('#payment').val() == "") {
                Swal.fire(
                    'لا يمكن اتمام هذه العملية!',
                    'الرجاء ادخال القيمة التي تم دفعها!',
                    'warning'
                );
            }
            else {
                $(this).submitDueOrder(1);
            }
        });


        $('#transactions').click(function () {
            loadTransactions();
            loadUserList();

            $('#pos_view').hide();
            $('#pointofsale').show();
            $('#transactions_view').show();
            $(this).hide();

        });


        $('#pointofsale').click(function () {
            $('#pos_view').show();
            $('#transactions').show();
            $('#transactions_view').hide();
            $(this).hide();
        });


        $("#viewRefOrders").click(function () {
            setTimeout(function () {
                $("#holdOrderInput").focus();
            }, 500);
        });


        $("#viewCustomerOrders").click(function () {
            setTimeout(function () {
                $("#holdCustomerOrderInput").focus();
            }, 500);
        });


        $('#newProductModal').click(function () {
            $('#saveProduct').get(0).reset();
            $('#current_img').text('');
        });


        $('#saveProduct').submit(function (e) {
            e.preventDefault();

            $(this).attr('action', api + 'inventory/product');
            $(this).attr('method', 'POST');

            $(this).ajaxSubmit({
                contentType: 'application/json',
                success: function (response) {

                    $('#saveProduct').get(0).reset();
                    $('#current_img').text('');

                    loadProducts();
                    Swal.fire({
                        title: 'تم حفظ المنتج بنجاح',
                        text: "قم بالاختيار للمتابعة",
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'اضافة جديد',
                        cancelButtonText: 'اغلاق'
                    }).then((result) => {

                        if (!result.value) {
                            $("#newProduct").modal('hide');
                        }
                    });
                }, error: function (data) {
                    console.log(data);
                }
            });

        });



        $('#saveCategory').submit(function (e) {
            e.preventDefault();

            if ($('#category_id').val() == "") {
                method = 'POST';
            }
            else {
                method = 'PUT';
            }

            $.ajax({
                type: method,
                url: api + 'categories/category',
                data: $(this).serialize(),
                success: function (data, textStatus, jqXHR) {
                    $('#saveCategory').get(0).reset();
                    loadCategories();
                    loadProducts();
                    Swal.fire({
                        title: 'تم حفظ التصنيف بنجاح',
                        text: "قم بالاختيار للمتابعة",
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'اضافة جديد',
                        cancelButtonText: 'اغلاق'
                    }).then((result) => {

                        if (!result.value) {
                            $("#newCategory").modal('hide');
                        }
                    });
                }, error: function (data) {
                    console.log(data);
                }

            });


        });


        $.fn.editProduct = function (index) {

            $('#Products').modal('hide');

            $("#category option").filter(function () {
                return $(this).val() == allProducts[index].category;
            }).prop("selected", true);
            // $('#barcode').val(allProducts[index].barcode);
            $('#productName').val(allProducts[index].name);
            $('#product_price').val(allProducts[index].price);
            // $('#quantity').val(allProducts[index].quantity);
            // $('#profit').val(allProducts[index].profit);
            // $('#expirationDate').val(allProducts[index].expirationDate);
            $('#product_id').val(allProducts[index]._id);
            $('#img').val(allProducts[index].img);

            if (allProducts[index].img != "") {

                $('#imagename').hide();
                $('#current_img').html(`<img src="${img_path + allProducts[index].img}" alt="">`);
                $('#rmv_img').show();
            }

            // if (allProducts[index].stock == 0) {
            //     $('#stock').prop("checked", true);
            // }

            $('#newProduct').modal('show');
        }


        $("#userModal").on("hide.bs.modal", function () {
            $('.perms').hide();
        });


        $.fn.editUser = function (index) {

            user_index = index;

            $('#Users').modal('hide');

            $('.perms').show();

            $("#user_id").val(allUsers[index]._id);
            $('#fullname').val(allUsers[index].fullname);
            $('#username').val(allUsers[index].username);
            $('#password').val(atob(allUsers[index].password));

            if (allUsers[index].perm_products == 1) {
                $('#perm_products').prop("checked", true);
            }
            else {
                $('#perm_products').prop("checked", false);
            }

            if (allUsers[index].perm_categories == 1) {
                $('#perm_categories').prop("checked", true);
            }
            else {
                $('#perm_categories').prop("checked", false);
            }

            if (allUsers[index].perm_transactions == 1) {
                $('#perm_transactions').prop("checked", true);
            }
            else {
                $('#perm_transactions').prop("checked", false);
            }

            if (allUsers[index].perm_users == 1) {
                $('#perm_users').prop("checked", true);
            }
            else {
                $('#perm_users').prop("checked", false);
            }

            if (allUsers[index].perm_settings == 1) {
                $('#perm_settings').prop("checked", true);
            }
            else {
                $('#perm_settings').prop("checked", false);
            }

            $('#userModal').modal('show');
        }


        $.fn.editCategory = function (index) {
            $('#Categories').modal('hide');
            $('#categoryName').val(allCategories[index].name);
            $('#category_id').val(allCategories[index]._id);
            $('#newCategory').modal('show');
        }


        $.fn.deleteProduct = function (id) {
            Swal.fire({
                title: 'هل انت متأكد؟',
                text: "سوف يتم حذف المنتج",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'حذف'
            }).then((result) => {

                if (result.value) {

                    $.ajax({
                        url: api + 'inventory/product/' + id,
                        type: 'DELETE',
                        success: function (result) {
                            loadProducts();
                            Swal.fire(
                                'تم!',
                                'تم حذف المنتج',
                                'success'
                            );

                        }
                    });
                }
            });
        }


        $.fn.deleteUser = function (id) {
            Swal.fire({
                title: 'هل انت متأكد؟',
                text: "سوف يتم حذف المستخدم",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'حذف'
            }).then((result) => {

                if (result.value) {

                    $.ajax({
                        url: api + 'users/user/' + id,
                        type: 'DELETE',
                        success: function (result) {
                            loadUserList();
                            Swal.fire(
                                'تم!',
                                'تم حذف المستخدم',
                                'success'
                            );

                        }
                    });
                }
            });
        }


        $.fn.deleteCategory = function (id) {
            Swal.fire({
                title: 'هل انت متأكد؟',
                text: "سوف يتم حذف التصنيف",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'حذف'
            }).then((result) => {

                if (result.value) {

                    $.ajax({
                        url: api + 'categories/category/' + id,
                        type: 'DELETE',
                        success: function (result) {
                            loadCategories();
                            Swal.fire(
                                'تم!',
                                'تم حذف التصنيف',
                                'success'
                            );

                        }
                    });
                }
            });
        }


        $('#productModal').click(function () {
            loadProductList();
        });


        $('#usersModal').click(function () {
            loadUserList();
        });


        $('#categoryModal').click(function () {
            loadCategoryList();
        });


        function loadUserList() {

            let counter = 0;
            let user_list = '';
            $('#user_list').empty();
            $('#userList').DataTable().destroy();

            $.get(api + 'users/all', function (users) {



                allUsers = [...users];

                users.forEach((user, index) => {

                    state = [];
                    let class_name = '';

                    if (user.status != "") {
                        state = user.status.split("_");

                        switch (state[0]) {
                            case 'Logged In': class_name = 'btn-default';
                                break;
                            case 'Logged Out': class_name = 'btn-light';
                                break;
                        }
                    }

                    counter++;
                    user_list += `<tr>
            <td>${user.fullname}</td>
            <td>${user.username}</td>
            <td class="${class_name}">${state.length > 0 ? state[0] : ''} <br><span style="font-size: 11px;"> ${state.length > 0 ? moment(state[1]).format('hh:mm A DD MMM YYYY') : ''}</span></td>
            <td>${user._id == 1 ? '<span class="btn-group"><button class="btn btn-dark"><i class="fa fa-edit"></i></button><button class="btn btn-dark"><i class="fa fa-trash"></i></button></span>' : '<span class="btn-group"><button onClick="$(this).editUser(' + index + ')" class="btn btn-warning"><i class="fa fa-edit"></i></button><button onClick="$(this).deleteUser(\''+ user._id + '\')" class="btn btn-danger"><i class="fa fa-trash"></i></button></span>'}</td></tr>`;

                    if (counter == users.length) {

                        $('#user_list').html(user_list);

                        $('#userList').DataTable({
                            "order": [[1, "desc"]]
                            , "autoWidth": false
                            , "info": true
                            , "JQueryUI": true
                            , "ordering": true
                            , "paging": false
                        });
                    }

                });

            });
        }


        function loadProductList() {
            let products = [...allProducts].sort(function (a, b) {
                return a.category - b.category;
              });;

            console.log(products)

            // products.sort(function (a, b) {
            //     return a.category - b.category;
            //   });

            // products.sort(function(a, b) {
            //     var nameA = a.cate.toUpperCase(); // ignore upper and lowercase
            //     var nameB = b.name.toUpperCase(); // ignore upper and lowercase
            //     if (nameA < nameB) {
            //       return -1;
            //     }
            //     if (nameA > nameB) {
            //       return 1;
            //     }
            //     // names must be equal
            //     return 0;
            //   });
            let product_list = '';
            let counter = 0;
            $('#product_list').empty();
            $('#productList').DataTable().destroy();
            let delay = 0;
          
            
            products.forEach((product, index) => {

                counter++;

                let category = allCategories.filter(function (category) {
                    return category._id == product.category;
                });
              



                product_list += `<tr>
            <td><img style="max-height: 50px; max-width: 50px; border: 1px solid #ddd;" src="${product.img == "" ? "./assets/images/default.jpg" : img_path + product.img}" id="product_img"></td>
            <td>${product.name}</td>
            <td>${product.price} ${'₪'}</td>
            <td>${category.length > 0 ? category[0].name : ''}</td>
            <td class="nobr"><span class="btn-group"><button onClick="$(this).editProduct(${index})" class="btn btn-warning btn-sm"><i class="fa fa-edit"></i></button><button onClick="$(this).deleteProduct(${product._id})" class="btn btn-danger btn-sm"><i class="fa fa-trash"></i></button></span></td></tr>`;

                if (counter == allProducts.length) {

                    $('#product_list').html(product_list);

                    products.forEach(pro => {
                        $("#" + pro._id + "");
                    });

                    $('#productList').DataTable({
                        // "order": [[1, "desc"]]
                        "autoWidth": false
                        , "info": true
                        , "JQueryUI": true
                        , "ordering": true
                        , "paging": false
                    });
                }

            });
        }


        function loadCategoryList() {
            let products = [...allProducts].sort(function (a, b) {
                return a.category - b.category;
              });;            let category_list = '';
            let counter = 0;
            $('#category_list').empty();
            $('#categoryList').DataTable().destroy();

            allCategories.forEach((category, index) => {

                counter++;
                category_list += `<tr>
     
            <td>${category.name}</td>
            <td><span class="btn-group"><button onClick="$(this).editCategory(${index})" class="btn btn-warning"><i class="fa fa-edit"></i></button><button onClick="$(this).deleteCategory(${category._id})" class="btn btn-danger"><i class="fa fa-trash"></i></button></span></td></tr>`;
            });

            if (counter == allCategories.length) {
                //------------------------------------------




                //----------------------------------------
                $('#category_list').html(category_list);
                $('#categoryList').DataTable({
                    "autoWidth": false
                    , "info": true
                    , "JQueryUI": true
                    , "ordering": true
                    , "paging": false

                });
            }
        }


        $.fn.serializeObject = function () {
            var o = {};
            var a = this.serializeArray();
            $.each(a, function () {
                if (o[this.name]) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        };



        $('#log-out').click(function () {

            Swal.fire({
                title: 'هل انت متأكد؟',
                text: "سوف يتم تسجيل الخروج",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'تسجيل الخروج'
            }).then((result) => {

                if (result.value) {
                    $.get(api + 'users/logout/' + user._id, function (data) {
                        storage.delete('auth');
                        storage.delete('user');
                        ipcRenderer.send('app-reload', '');
                    });
                }
            });
        });



        $('#settings_form').on('submit', function (e) {
            e.preventDefault();
            let formData = $(this).serializeObject();
            let mac_address;

            api = 'http://' + host + ':' + port + '/api/';

            macaddress.one(function (err, mac) {
                mac_address = mac;
            });

            formData['app'] = $('#app').find('option:selected').text();
            formData['mac'] = mac_address;
            formData['till'] = 1;

            $('#settings_form').append('<input type="hidden" name="app" value="' + formData.app + '" />');

            if (formData.percentage != "" && !$.isNumeric(formData.percentage)) {
                Swal.fire(
                    'Oops!',
                    'Please make sure the tax value is a number',
                    'warning'
                );
            }
            else {
                storage.set('settings', formData);

                $(this).attr('action', api + 'settings/post');
                $(this).attr('method', 'POST');


                $(this).ajaxSubmit({
                    contentType: 'application/json',
                    success: function (response) {

                        ipcRenderer.send('app-reload', '');

                    }, error: function (data) {
                        console.log(data);
                    }

                });

            }

        });



        $('#net_settings_form').on('submit', function (e) {
            e.preventDefault();
            let formData = $(this).serializeObject();

            if (formData.till == 0 || formData.till == 1) {
                Swal.fire(
                    'Oops!',
                    'Please enter a number greater than 1.',
                    'warning'
                );
            }
            else {
                if (isNumeric(formData.till)) {
                    formData['app'] = $('#app').find('option:selected').text();
                    storage.set('settings', formData);
                    ipcRenderer.send('app-reload', '');
                }
                else {
                    Swal.fire(
                        'Oops!',
                        'Till number must be a number!',
                        'warning'
                    );
                }

            }

        });



        $('#saveUser').on('submit', function (e) {
            e.preventDefault();
            let formData = $(this).serializeObject();


            if (ownUserEdit) {
                if (formData.password != atob(user.password)) {
                    if (formData.password != formData.pass) {
                        Swal.fire(
                            'Oops!',
                            'Passwords do not match!',
                            'warning'
                        );
                    }
                }
            }
            else {
                if (formData.password != atob(allUsers[user_index].password)) {
                    if (formData.password != formData.pass) {
                        Swal.fire(
                            'Oops!',
                            'Passwords do not match!',
                            'warning'
                        );
                    }
                }
            }



            if (formData.password == atob(user.password) || formData.password == atob(allUsers[user_index].password) || formData.password == formData.pass) {
                $.ajax({
                    url: api + 'users/post',
                    type: 'POST',
                    data: JSON.stringify(formData),
                    contentType: 'application/json; charset=utf-8',
                    cache: false,
                    processData: false,
                    success: function (data) {

                        if (ownUserEdit) {
                            ipcRenderer.send('app-reload', '');
                        }

                        else {
                            $('#userModal').modal('hide');

                            loadUserList();

                            $('#Users').modal('show');
                            Swal.fire(
                                'Ok!',
                                'User details saved!',
                                'success'
                            );
                        }


                    }, error: function (data) {

                    }

                });

            }

        });



        $('#app').change(function () {
            if ($(this).find('option:selected').text() == 'Network Point of Sale Terminal') {
                $('#net_settings_form').show(500);
                $('#settings_form').hide(500);
                macaddress.one(function (err, mac) {
                    $("#mac").val(mac);
                });
            }
            else {
                $('#net_settings_form').hide(500);
                $('#settings_form').show(500);
            }

        });



        $('#cashier').click(function () {

            ownUserEdit = true;

            $('#userModal').modal('show');

            $("#user_id").val(user._id);
            $("#fullname").val(user.fullname);
            $("#username").val(user.username);
            $("#password").val(atob(user.password));

        });



        $('#add-user').click(function () {

            if (platform.app != 'Network Point of Sale Terminal') {
                $('.perms').show();
            }

            $("#saveUser").get(0).reset();
            $('#userModal').modal('show');

        });



        $('#settings').click(function () {

            if (platform.app == 'Network Point of Sale Terminal') {
                $('#net_settings_form').show(500);
                $('#settings_form').hide(500);

                $("#ip").val(platform.ip);
                $("#till").val(platform.till);

                macaddress.one(function (err, mac) {
                    $("#mac").val(mac);
                });

                $("#app option").filter(function () {
                    return $(this).text() == platform.app;
                }).prop("selected", true);
            }
            else {
                $('#net_settings_form').hide(500);
                $('#settings_form').show(500);

                $("#settings_id").val("1");
                $("#store").val(settings.store);
                $("#address_one").val(settings.address_one);
                $("#address_two").val(settings.address_two);
                $("#contact").val(settings.contact);
                $("#tax").val(settings.tax);
                $("#symbol").val(settings.symbol);
                $("#percentage").val(settings.percentage);
                $("#footer").val(settings.footer);
                $("#logo_img").val(settings.img);
                if (settings.charge_tax == 'on') {
                    $('#charge_tax').prop("checked", true);
                }
                if (settings.img != "") {
                    $('#logoname').hide();
                    $('#current_logo').html(`<img src="${img_path + settings.img}" alt="">`);
                    $('#rmv_logo').show();
                }

                $("#app option").filter(function () {
                    return $(this).text() == settings.app;
                }).prop("selected", true);
            }




        });


    });


    $('#rmv_logo').click(function () {
        $('#remove_logo').val("1");
        $('#current_logo').hide(500);
        $(this).hide(500);
        $('#logoname').show(500);
    });


    $('#rmv_img').click(function () {
        $('#remove_img').val("1");
        $('#current_img').hide(500);
        $(this).hide(500);
        $('#imagename').show(500);
    });


    $('#print_list').click(function () {

        $("#loading").show();

        $('#productList').DataTable().destroy();

        const filename = 'productList.pdf';

        html2canvas($('#all_products').get(0)).then(canvas => {
            let height = canvas.height * (25.4 / 96);
            let width = canvas.width * (25.4 / 96);
            let pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, width, height);

            $("#loading").hide();
            pdf.save(filename);
        });



        $('#productList').DataTable({
            "order": [[1, "desc"]]
            , "autoWidth": false
            , "info": true
            , "JQueryUI": true
            , "ordering": true
            , "paging": false
        });

        $(".loading").hide();

    });

}


$.fn.print = function () {

    printJS({ printable: receipt, type: 'raw-html' });

}


function loadTransactions() {

    let tills = [];
    let users = [];
    let sales = 0;
    // let subProfit = 0;
    // let totalProfit = 0;
    let transact = 0;
    let unique = 0;

    sold_items = [];
    sold = [];

    let counter = 0;
    let transaction_list = '';
    let query = `by-date?start=${start_date}&end=${end_date}&user=${by_user}&status=${by_status}&till=${by_till}`;


    $.get(api + query, function (transactions) {

        if (transactions.length > 0) {


            $('#transaction_list').empty();
            $('#transactionList').DataTable().destroy();
            // here the trans data 
            allTransactions = [...transactions];

            transactions.forEach((trans, index) => {
                sales += parseFloat(trans.total);


                transact++;



                trans.items.forEach(item => {
                    //subProfit += item.profit * item.quantity;

                    sold_items.push(item);
                });
               // totalProfit += subProfit;


                if (!tills.includes(trans.till)) {
                    tills.push(trans.till);
                }

                if (!users.includes(trans.user_id)) {
                    users.push(trans.user_id);
                }

                counter++;
                transaction_list += `<tr>
                                <td>${trans.order}</td>
                                <td class="nobr">${moment(trans.date).format('YYYY MMM DD hh:mm:ss')}</td>
                                <td>${trans.total + " " + settings.symbol}</td>
                                <td>${trans.paid == "" ? "" : trans.paid + " " + settings.symbol}</td>
                                <td>${trans.change ? Math.abs(trans.change).toFixed(2) + " " + settings.symbol : ''}</td>
                                <td>${trans.paid == "" ? "" : trans.payment_type == 0 ? "Cash" : 'Card'}</td>
                                <td>${trans.user}</td>
                                <td>${trans.paid == "" ? '<button class="btn btn-dark"><i class="fa fa-search-plus"></i></button>' : '<button onClick="$(this).viewTransaction(' + index + ')" class="btn btn-info"><i class="fa fa-search-plus"></i></button></td>'}
                                <td><button onClick="$(this).deleteTransaction(${trans.order})" class="btn btn-danger"><i class="fa fa-trash"></i></button></td>
                                </tr>
                                `;
                // subProfit = 0;
                if (counter == transactions.length) {

                    $('#total_sales #counter').text(parseFloat(sales).toFixed(2) + " " + settings.symbol);
                    $('#total_transactions #counter').text(transact);
                    // $('#total_profit #counter').text(totalProfit + " " + settings.symbol);
                    const result = {};

                    for (const { product_name, price, quantity, id } of sold_items) {
                        if (!result[product_name]) result[product_name] = [];
                        result[product_name].push({ id, price, quantity });
                    }

                    for (item in result) {

                        let price = 0;
                        let quantity = 0;
                        let id = 0;

                        result[item].forEach(i => {
                            id = i.id;
                            price = i.price;
                            quantity += i.quantity;
                        });

                        sold.push({
                            id: id,
                            product: item,
                            qty: quantity,
                            price: price
                        });
                    }

                    loadSoldProducts();


                    if (by_user == 0 && by_till == 0) {

                        userFilter(users);
                        tillFilter(tills);
                    }


                    $('#transaction_list').html(transaction_list);
                    $('#transactionList').DataTable({
                        "order": [[1, "desc"]]
                        , "autoWidth": false
                        , "info": true
                        , "JQueryUI": true
                        , "ordering": true
                        , "paging": true
                    });
                }
            });
        }
        else {
            Swal.fire(
                'No data!',
                'No transactions available within the selected criteria',
                'warning'
            );
        }

    });
}


function discend(a, b) {
    if (a.qty > b.qty) {
        return -1;
    }
    if (a.qty < b.qty) {
        return 1;
    }
    return 0;
}


function loadSoldProducts() {

    sold.sort(discend);

    let counter = 0;
    let sold_list = '';
    let items = 0;
    let products = 0;
    $('#product_sales').empty();

    sold.forEach((item, index) => {
        items += item.qty;
        products++;

        let product = allProducts.filter(function (selected) {
            return selected._id == item.id;
        });

        counter++;

        sold_list += `<tr>
            <td>${item.product}</td>
            <td>${item.qty}</td>
            <td>${(item.qty * parseFloat(item.price)).toFixed(2) + " " + settings.symbol}</td>
            </tr>`;

        if (counter == sold.length) {
            $('#total_items #counter').text(items);
            $('#total_products #counter').text(products);
            $('#product_sales').html(sold_list);
        }
    });
}


function userFilter(users) {

    $('#users').empty();
    $('#users').append(`<option value="0">All</option>`);

    users.forEach(user => {
        let u = allUsers.filter(function (usr) {
            return usr._id == user;
        });

        $('#users').append(`<option value="${user}">${u[0].fullname}</option>`);
    });

}


function tillFilter(tills) {

    $('#tills').empty();
    $('#tills').append(`<option value="0">All</option>`);
    tills.forEach(till => {
        $('#tills').append(`<option value="${till}">${till}</option>`);
    });

}

$.fn.deleteTransaction = function(id){


    console.log(id);
    Swal.fire({
        title: 'هل انت متأكد؟',
        text: "سوف يتم حذف الطلبية",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: ' حذف'
    }).then((result) => {

        if (result.value) {
            $.post(api + 'transactions/delete/' + id, function (data) {
                console.log(data);
            });
        }
    });

}


$.fn.viewTransaction = function (index) {

    transaction_index = index;

    let discount = allTransactions[index].discount;
    let customer = allTransactions[index].customer == 0 ? 'Walk in Customer' : allTransactions[index].customer.username;
    let refNumber = allTransactions[index].ref_number != "" ? allTransactions[index].ref_number : allTransactions[index].order;
    let orderNumber = allTransactions[index].order;
    let type = "";
    let tax_row = "";
    let items = "";
    let products = allTransactions[index].items;

    products.forEach(item => {
        items += "<tr><td>" + item.product_name + "</td><td>" + item.quantity + "</td><td>" + parseFloat(item.price).toFixed(2) + " " + settings.symbol + "</td></tr>";

    });


    switch (allTransactions[index].payment_type) {

        case 2: type = "Card";
            break;

        default: type = "Cash";

    }


    if (allTransactions[index].paid != "") {
        payment = `<tr>
                    <td>Paid</td>
                    <td>:</td>
                    <td>${allTransactions[index].paid + " " + settings.symbol}</td>
                </tr>
                <tr>
                    <td>Change</td>
                    <td>:</td>
                    <td>${Math.abs(allTransactions[index].change).toFixed(2) + " " + settings.symbol}</td>
                </tr>
                <tr>
                    <td>Method</td>
                    <td>:</td>
                    <td>${type}</td>
                </tr>`
    }



    if (settings.charge_tax) {
        tax_row = `<tr>
                <td>Vat(${settings.percentage})% </td>
                <td>:</td>
                <td>${parseFloat(allTransactions[index].tax).toFixed(2)} ${settings.symbol}</td>
            </tr>`;
    }



    receipt = `<div style="font-size: 10px;">                            
        <p style="text-align: center;">
        ${settings.img == "" ? settings.img : '<img style="max-width: 50px;max-width: 100px;" src ="' + img_path + settings.img + '" /><br>'}
            <span style="font-size: 22px;">${settings.store}</span> <br>
            ${settings.address_one} <br>
            ${settings.address_two} <br>
            ${settings.contact != '' ? 'Tel: ' + settings.contact + '<br>' : ''} 
            ${settings.tax != '' ? 'Vat No: ' + settings.tax + '<br>' : ''} 
    </p>
    <hr>
    <left>
        <p>
        Invoice : ${orderNumber} <br>
        Ref No : ${refNumber} <br>
        Customer : ${allTransactions[index].customer == 0 ? 'Walk in Customer' : allTransactions[index].customer.name} <br>
        Cashier : ${allTransactions[index].user} <br>
        Date : ${moment(allTransactions[index].date).format('DD MMM YYYY HH:mm:ss')}<br>
        </p>

    </left>
    <hr>
    <table width="100%">
        <thead style="text-align: left;">
        <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
        </tr>
        </thead>
        <tbody>
        ${items}                
 
        <tr>                        
            <td><b>Subtotal</b></td>
            <td>:</td>
            <td><b>${allTransactions[index].subtotal} ${settings.symbol}</b></td>
        </tr>
        <tr>
            <td>Discount</td>
            <td>:</td>
            <td>${discount > 0 ? parseFloat(allTransactions[index].discount).toFixed(2) + " " + settings.symbol : ''}</td>
        </tr>
        
        ${tax_row}
    
        <tr>
            <td><h3>Total</h3></td>
            <td><h3>:</h3></td>
            <td>
                <h3>${allTransactions[index].total} ${settings.symbol}</h3>
            </td>
        </tr>
        ${payment == 0 ? '' : payment}
        </tbody>
        </table>
        <br>
        <hr>
        <br>
        <p style="text-align: center;">
         ${settings.footer}
         </p>
        </div>`;

    $('#viewTransaction').html('');
    $('#viewTransaction').html(receipt);

    $('#orderModal').modal('show');

}


$('#status').change(function () {
    by_status = $(this).find('option:selected').val();
    loadTransactions();
});



$('#tills').change(function () {
    by_till = $(this).find('option:selected').val();
    loadTransactions();
});


$('#users').change(function () {
    by_user = $(this).find('option:selected').val();
    loadTransactions();
});


$('#reportrange').on('apply.daterangepicker', function (ev, picker) {

    start = picker.startDate.format('DD MMM YYYY hh:mm A');
    end = picker.endDate.format('DD MMM YYYY hh:mm A');

    start_date = picker.startDate.toDate().toJSON();
    end_date = picker.endDate.toDate().toJSON();


    loadTransactions();
});


function authenticate() {
    $('#loading').append(
        `<div id="load"><form id="account"><div class="form-group"><input type="text" placeholder="اسم المستخدم" name="username" class="form-control"></div>
        <div class="form-group"><input type="password" placeholder="كلمة المرور" name="password" class="form-control"></div>
        <div class="form-group"><input type="submit" class="btn btn-block btn-default" value="تسجيل الدخول"></div></form>`
    );
}


$('body').on("submit", "#account", function (e) {
    e.preventDefault();
    let formData = $(this).serializeObject();

    if (formData.username == "" || formData.password == "") {

        Swal.fire(
            'تأكد من الادخال!',
            auth_empty,
            'warning'
        );
    }
    else {

        $.ajax({
            url: api + 'users/login',
            type: 'POST',
            data: JSON.stringify(formData),
            contentType: 'application/json; charset=utf-8',
            cache: false,
            processData: false,
            success: function (data) {
                if (data._id) {
                    storage.set('auth', { auth: true });
                    storage.set('user', data);
                    ipcRenderer.send('app-reload', '');
                }
                else {
                    if (data == 'disabled') {
                        Swal.fire(
                            'لقد انتهى ترخيص البرنامج',
                            "يرجى التواصل مع فريق التطوير لتجديد النسخة لديك",
                            'error'
                        )
                    } else {
                        Swal.fire(
                            'مهلا!',
                            auth_error,
                            'warning'
                        );
                    }
                }

            }, error: function (data) {
                console.log(data);
            }
        });
    }
});


$('#quit').click(function () {
    Swal.fire({
        title: 'هل انت متأكد؟',
        text: "سوف يتم اغلاق تطبيق نقطة البيع",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'اغلاق'
    }).then((result) => {

        if (result.value) {
            ipcRenderer.send('app-quit', '');
        }
    });
});


