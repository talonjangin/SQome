
App = {

  web3Provider: null,
  contracts: {},
	
  init: function() {
    $.getJSON('../real-estate.json', function(data) {
      var list = $('#list');
      var template = $('#template');

      for (i = 0; i < data.length; i++) {
        template.find('img').attr('src', data[i].picture);
        template.find('.id').text(data[i].id);
        template.find('.type').text(data[i].type);
        template.find('.area').text(data[i].area);
        template.find('.price').text(data[i].price);
        template.find('.hostID').text(data[i].hostID);
        template.find('.date').text(data[i].date);
        list.append(template.html());
      }
    })

    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
	  $.getJSON('RealEstate.json', function(data) {
      App.contracts.RealEstate = TruffleContract(data);
      App.contracts.RealEstate.setProvider(App.web3Provider);
      App.listenToEvents();
    });
  },

  buyRealEstate: function() {	
    var id = $('#id').val();
    var name = $('#name').val();
    var price = $('#price').val();
    var age = $('#age').val();
    var hostID = $('#hostID').val();

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.RealEstate.deployed().then(function(instance) {
        var nameUtf8Encoded = utf8.encode(name);
        return instance.buyRealEstate(id, web3.toHex(nameUtf8Encoded), age, { from: account, value: price });
      }).then(function() {
        $('#name').val('');
        $('#age').val('');
        $('#buyModal').modal('hide');  
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  loadRealEstates: function() {
    App.contracts.RealEstate.deployed().then(function(instance) {
      return instance.getAllBuyers.call();
    }).then(function(buyers) {
      for (i = 0; i < buyers.length; i++) {
        if (buyers[i] !== '0x0000000000000000000000000000000000000000') {
          var imgType = $('.panel-realEstate').eq(i).find('img').attr('src').substr(7);

          switch(imgType) {
            case 'apartment.jpg':
              $('.panel-realEstate').eq(i).find('img').attr('src', 'images/apartment_sold.jpg')
              break;
            case 'townhouse.jpg':
              $('.panel-realEstate').eq(i).find('img').attr('src', 'images/townhouse_sold.jpg')
              break;
            case 'house.jpg':
              $('.panel-realEstate').eq(i).find('img').attr('src', 'images/house_sold.jpg')
              break;
          }

          $('.panel-realEstate').eq(i).find('.btn-buy').text('예약완료').attr('disabled', true);
          $('.panel-realEstate').eq(i).find('.btn-buyerInfo').removeAttr('style');
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    })
  },
	
  listenToEvents: function() {
    var temp;
	  App.contracts.RealEstate.deployed().then(function(instance) {
      instance.LogBuyRealEstate({}, { fromBlock: 0, toBlock: 'latest' }).watch(function(error, event) {
        if (!error) {
         
          temp = event.args._id
        } else {
          console.error(error);
        }

        $.getJSON('../real-estate.json', function(data) {

          $('#show-qr-product').append('<p>' + '형태 : ' + data[temp].type + ', 면적 : ' + data[temp].area  + '</p>'+ '</br>');
          $('#show-qr-price').append('<p>' + data[temp].price + '  ETH' + '</p>');
          $('#show-qr-number').append('<p>' + data[temp].number + '</p>' + '</br>');
          $('#show-qr-address').append('<p>' + data[temp].address + '</p>' + '</br>');
        
      })



        App.loadRealEstates();
      })
    })
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });

  $('#buyModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).parent().find('.id').text();
    var price = web3.toWei(parseFloat($(e.relatedTarget).parent().find('.price').text() || 0), "ether");

    $(e.currentTarget).find('#id').val(id);
    $(e.currentTarget).find('#price').val(price);
  });

  $('#buyerInfoModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).parent().find('.id').text();
   
    App.contracts.RealEstate.deployed().then(function(instance) {
      return instance.getBuyerInfo.call(id);
    }).then(function(buyerInfo) {
      $(e.currentTarget).find('#buyerAddress').text(buyerInfo[0]);
      $(e.currentTarget).find('#buyerName').text(web3.toUtf8(buyerInfo[1]));
      $(e.currentTarget).find('#buyerAge').text(buyerInfo[2]);
    }).catch(function(err) {
      console.log(err.message);
    })
  });
});
