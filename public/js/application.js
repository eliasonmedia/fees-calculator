// Define gateway prices
var costs = [
	{
		name: 'etsy_pp',
		label: 'Etsy (PayPal)',
		merchvar: 3.5,
		merchfixed: 0.20,
		gatevar: 2.9,
		gatefixed: 0.30,
		subfee: 0.0,
		url: 'http://www.etsy.com'
	},
	{
		name: 'etsy_direct',
		label: 'Etsy (Direct Checkout)',
		merchvar: 6.5,
		merchfixed: 0.20,
		gatevar: 3.0,
		gatefixed: 0.25,
		subfee: 0.0,
		url: 'http://www.etsy.com'
	},
	{
		name: 'gs_pp',
		label: 'Goodsmiths (PayPal)',
		merchvar: 2.0,
		merchfixed: 0.0,
		gatevar: 2.9,
		gatefixed: 0.30,
		subfee: 0.0,
		url: 'https://www.goodsmiths.com/splash'
	},
	{
		name: 'gs_dw',
		label: 'Goodsmiths (Dwolla)',
		url: 'http://www.goodsmiths.com',
		merchvar: 2.0,
		merchfixed: 0.0,
		gatevar: 0.0,
		subfee: 0.0,
		gatefixed: {
			trigger: 10.01,
			cost: 0.25,
			maxAmount: 5000
		}
	},
	{
		name: 'bon_all',
		label: 'Bonanza (All Methods)',
		merchvar: 3.5,
		fixed: 0.0,
		gatevar: 2.9,
		gatefixed: 0.30,
		subfee: 0.0,
		url: 'http://www.bonanza.com'
	},
	{
		name: 'af_all',
		label: 'ArtFire (All Methods)',
		merchvar: 0.0,
		fixed: 0.0,
		gatevar: 2.9,
		gatefixed: 0.30,
		subfee: 155.40,
		url: 'http://www.artfire.com'
	}
];

$(function() {
	// Cache common queries
	var box = $('#fee-box'),
		btn = $('#calc-btn');

	$('.toggle_button').toggleButton({callback: function() {
		$("#single").toggle();
		$("#annual").toggle();
	}});

	box
		.fadeIn(1000)
		.hover(
			function() {
				if(box.hasClass('hidden')) {
					box.stop(true, true).animate({top: '-=50'}, 200);
				}
			},
			function() {
				if(box.hasClass('hidden')) {
					box.stop(true, true).animate({top: box.attr('data-hide-top')}, 200);
				}
			}
		)
		.click(function() {
			if(box.hasClass('hidden')) {
				box.removeClass('hidden');

				box.animate(
					{
						top: 60
					},
					700,
					'easeInBack'
				);
			}
		});

	// Button click event
	btn.click(function() {
		var amount = parsePrice($('.amount:visible').val())
			freq = parsePrice($('#freq').val());

		if(amount == 0) {
			alert("Wait... That doesn't look right");
			return;
		}

		box
			.attr('data-hide-top', $(window).height() - 80)
			.css('position', 'fixed');

		box.animate(
			{
				top: box.attr('data-hide-top')
			},
			1000,
			'easeOutBack',
			function() {
				box.addClass('hidden');
			}
		);

		// Let's make this look somewhat cool
		$('#results').html('<div class="loader">&nbsp;</div>');
		setTimeout(function() {
			// Give this a "real" feeling of number crunching...
			calc(amount, freq);
		}, 1500);
	});

	// Bind the enter key to submit
	$('input[type=text]')
		.keydown(function(e) {
			if(e.keyCode == 13) { btn.trigger('click'); }
		});

	// Focus the first visible amount input
	$('.amount:visible')
		.filter(':visible').focus();

	// Was amount specifed in URL? Auto-trigger a calculation
	if(window.location.hash.indexOf('#compare') !== -1) {
		var params = window.location.hash.split('/'),
			type = params[1]
			amount = params[2],
			freq = params[3];

		box
			.find('#trans-type').val(type).end()
			.find('input.amount').val(amount).end()
			.find('#freq').val(freq);

		btn.trigger('click');
	}

	// About Page Link
	$('#about-link, #calculator-link').click(function() {
		$("#about")
			.toggle()
			.siblings().toggle();
	});
});

/**
* Turns matched element(s) into a custom gender selection box
* @returns {jQuery}
*/
jQuery.fn.toggleButton = function(options) {
	var opts = $.extend({
		label: '.title',
		callback: false
	}, options);

	return this.each(function() {
		var el = $(this);
		var input = el.find("input");

		if (input.val()) {
			el.find("a[val='" + input.val() + "']").addClass("pressed").siblings().removeClass("pressed");
		} else {
			input.val(el.find(".pressed").attr('val'));
		}

		el.find("a").click(function(e) {
			e.preventDefault();
			var obj = $(this);

			obj
				.addClass("pressed")
				.siblings().removeClass("pressed")
				.siblings("input").val(obj.attr('val'));
				
			if (obj.attr('callback'))
				eval(obj.attr('callback'));

			if (opts.callback)
				opts.callback.call();
		});
		
		el.siblings(opts.label).click(function() {
			el.find("a:not(.pressed)").trigger("click");
		});
	});
}

Number.prototype.formatMoney = function(c, d, t){
	var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;

	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

var compare_total = function(a, b) {
	if (a.total < b.total)
		return 1;
	if (a.total > b.total)
		return -1;

	return 0;
}

var parsePrice = function(str) {
	return str.replace(/[^0-9\.]+/g, '');
}

var calc = function(amount, freq) {
	// Start calculating...
	var type = $('#trans-type').val(),
		results = [],
		resultsBlock = $('#results').empty(),
		resultBlock = ' <div class="left">' +
							'<a href="#" title="" class="name">' +
								'<h3></h3>' +
							'</a>' +
						'</div>' +
						'<div class="right">' +
							'<div class="merchant">' +
								'<span class="top"></span>' +
								'<p>$<span></span></p>' +
								'<span class="bottom">Merchant Fee</span>' +
							'</div>' +
							'<div class="plus"><p>+</p></div>' +
							'<div class="gateway">' +
								'<p>$<span></span></p>' +
								'<span class="bottom">Gateway Fee</span>' +
							'</div>' +
							'<div class="times"><p>&times;</p></div>' +
							'<div class="freq">' +
								'<p><span></span></p>' +
								'<span class="bottom">Quantity</span>' +
							'</div>' +
							'<div class="eq"><p>=</p></div>' +
							'<div class="total">' +
								'<p>$<span></span></p>' +
								'<span class="bottom">Total Fee</span>' +
							'</div>' +
						'</div>';

	// Push to the history stack
	var url = "/#compare/" + type + '/' + amount + '/' + freq;
	window.history.pushState({}, "Compare Fees", url);

	// Insert page title
	resultsBlock.append(type == 'annual' ? "<h2>How much you pay annually:</h2>" : "<h2>How much you pay per transaction:</h2>");

	// Create elements for each payment gateway
	for (var i = costs.length - 1; i >= 0; i--) {
		var result = $('<div/>', {
				'class': 'result ' + costs[i].name,
				'html': resultBlock
			});

		// Calc merchant costs
		var merchvar = ((costs[i].merchvar / 100) * amount),
			isFixedObject = (typeof costs[i].merchfixed == 'object'),
			merchfixed = ((isFixedObject && (amount >= costs[i].merchfixed.trigger)) || typeof costs[i].merchfixed == 'number') ? (isFixedObject ? costs[i].merchfixed.cost : costs[i].merchfixed) : 0;

		// Calc gateway costs
		var gatevar = ((costs[i].gatevar / 100) * amount),
			isFixedObject = (typeof costs[i].gatefixed == 'object'),
			gatefixed = ((isFixedObject && (amount >= costs[i].gatefixed.trigger)) || typeof costs[i].gatefixed == 'number') ? (isFixedObject ? costs[i].gatefixed.cost : costs[i].gatefixed) : 0;


		// Compensate for Dwolla's max transaction amount
		if (amount > costs[i].gatefixed.maxAmount) {
			fixed *= Math.ceil(amount / costs[i].gatefixed.maxAmount);
		}

		// Calculate merchant subtotal
		var merchant = (+merchvar + +merchfixed)

		// Calculate gateway subtotal
		var gateway = (+gatevar + +gatefixed)

		// Calculate final total
		var total = (+merchant + +gateway);

		// Compensate for annual recurring transactions
		if(type == 'annual') {
			total = total * freq + subfee;
		}

		result
			.find('.name')
				.attr('href', costs[i].url)
				.attr('title', 'Checkout ' + costs[i].label + "'s site")
				.end()
			.find('.name h3')
				.text(costs[i].label)
				.end()
			.find('.merchant .top')
				.text(costs[i].merchvar.formatMoney(2, '.', ',') + '% + ' + costs[i].gatefixed.formatMoney(2, '.', ',') + ' for ' + amount + ' items =')
				.end()
			.find('.gateway .top')
				.text(costs[i].merchvar.formatMoney(2, '.', ',') + '% + ' + costs[i].gatefixed.formatMoney(2, '.', ',') + ' for ' + amount + ' items =')
				.end()
			.find('.merchant p span')
				.text(merchant.formatMoney(2, '.', ','))
				.end()
			.find('.gateway p span')
				.text(gateway.formatMoney(2, '.', ','))
				.end()
			.find('.freq p span')
				.text(freq)
				.end()
			.find('.total p span')
				.text(total.formatMoney(2, '.', ','));

		results.push({total: total, result: result});
	};

	// Sort by total comission
	results.sort(compare_total);

	// Append to the document
	for (var i = results.length - 1; i >= 0; i--) {
		results[i].result
			.appendTo(resultsBlock)
			.css({top: -1000})
			.animate({top: 0}, i * 500, 'easeOutBack');

		if (i < (results.length - 1)) {
			results[i].result.addClass('small');
		}
	};

	// Style as annual average?
	resultsBlock.toggleClass('annual', (type == 'annual'));
}
