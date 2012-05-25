// Define gateway prices
var costs = [
	{
		name: 'etsypp',
		label: '',
		variable: 6.4,
		fixed: 0.50,
		mvar: 3.5,
		mfixed: 0.40,
		gvar: 2.9,
		gfixed: 0.30,
		url: 'http://www.etsy.com',
		subfee: 0.0
	},
	{
		name: 'etsydc',
		label: '',
		variable: 6.5,
		fixed: 0.45,
		mvar: 3.5,
		mfixed: 0.40,
		gvar: 3.0,
		gfixed: 0.25,
		url: 'http://www.etsy.com',
		subfee: 0.0
	},
	{
		name: 'gspp',
		label: '',
		variable: 4.9,
		fixed: 0.30,
		mvar: 2.0,
		mfixed: 0.0,
		gvar: 2.9,
		gfixed: 0.30,
		url: 'http://www.goodsmiths.com',
		subfee: 0.0
	},
	{
		name: 'gsdw',
		label: '',
		url: 'http://www.goodsmiths.com',
		variable: 2.0,
		fixed: {
			trigger: 10.01,
			cost: 0.25,
			maxAmount: 5000
		},
		mvar: 2.0,
		mfixed: 0.0,
		gvar: 0.0,
		gfixed: {
			trigger: 10.01,
			cost: 0.25,
			maxAmount: 5000
		},
		subfee: 0.0
	},
	{
		name: 'bonall',
		label: '',
		url: 'http://www.bonanza.com',
		variable: 6.4,
		fixed: 0.30,
		mvar: 3.5,
		mfixed: 0.0,
		gvar: 2.9,
		gfixed: 0.30,
		subfee: 0.0
	},
	{
		name: 'afall',
		label: '',
		url: 'http://www.artfire.com',
		variable: 0.0,
		fixed: 0.30,
		mvar: 0.0,
		mfixed: 0.0,
		gvar: 2.9,
		gfixed: 0.30,
		subfee: 12.95
	},
	{
		name: 'bcpp',
		label: '',
		url: 'http://www.bigcartel.com',
		variable: 2.9,
		fixed: 0.30,
		mvar: 0.0,
		mfixed: 0.0,
		gvar: 2.9,
		gfixed: 0.30,
		subfee: 9.99
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

	// Auto format amount inputs
	$('.amount').on('blur', function() {
		var el = $(this),
			val = (+parsePrice(el.val())).formatMoney(2, '.', ',');

		el.val('$' + val);
	});

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
							'<div class="variable">' +
								'<span class="top"></span>' +
								'<p>$<span></span></p>' +
								'<span class="bottom">Craft Site</span>' +
							'</div>' +
							'<div class="plus"><p>+</p></div>' +
							'<div class="fixed">' +
								'<span class="top"></span>' +
								'<p>$<span></span></p>' +
								'<span class="bottom">Payment Proc.</span>' +
							'</div>' +
							'<div class="times"><p>&times;</p></div>' +
							'<div class="freq">' +
								'<p><span></span></p>' +
								'<span class="bottom">Quantity</span>' +
							'</div>' +
							'<div class="eq"><p>=</p></div>' +
							'<div class="total">' +
								'<span class="top"></span>' +
								'<p>$<span></span></p>' +
								'<span class="bottom">Total Fees</span>' +
							'</div>' +
						'</div>';

	// Push to the history stack
	var url = "/#compare/" + type + '/' + amount + '/' + freq;
	window.history.pushState({}, "Compare Fees", url);

	// Track this
	if(clicky) {
		clicky.log(url, 'Calculate');
	}

	// Insert page title
	resultsBlock.append(type == 'annual' ? "<h2>How much you pay per month:</h2>" : "<h2>How much you pay to sell one item:</h2>");

	// Create elements for each payment gateway
	for (var i = costs.length - 1; i >= 0; i--) {
		var result = $('<div/>', {
				'class': 'result ' + costs[i].name,
				'html': resultBlock
			});

		// Calc costs
		var variable = ((costs[i].variable / 100) * amount),
			isFixedObject = (typeof costs[i].fixed == 'object'),
			fixed = ((isFixedObject && (amount >= costs[i].fixed.trigger)) || typeof costs[i].fixed == 'number') ? (isFixedObject ? costs[i].fixed.cost : costs[i].fixed) : 0,
			isFixedObject = (typeof costs[i].mfixed == 'object'),
			mfixed = ((isFixedObject && (amount >= costs[i].mfixed.trigger)) || typeof costs[i].mfixed == 'number') ? (isFixedObject ? costs[i].mfixed.cost : costs[i].mfixed) : 0,
			isFixedObject = (typeof costs[i].gfixed == 'object'),
			gfixed = ((isFixedObject && (amount >= costs[i].gfixed.trigger)) || typeof costs[i].gfixed == 'number') ? (isFixedObject ? costs[i].gfixed.cost : costs[i].gfixed) : 0;

		// Compensate for Dwolla's max transaction amount
		if (amount > costs[i].fixed.maxAmount) {
			fixed *= Math.ceil(amount / costs[i].fixed.maxAmount);
		}

		// Store some vars
		var subfee = (costs[i].subfee);
		var craftsite = (((costs[i].mvar / 100) * amount) + mfixed);
		var processor = (((costs[i].gvar / 100) * amount) + gfixed);

		// Calculate final total
		var total = (+craftsite + +processor);

		// Calculate monthly transactions and subscription fees
		if(type == 'annual') {
			total = (total * freq + (costs[i].subfee));
		}
		if(type == 'single') {
			total = (total + (costs[i].subfee));
		}

		result
			.find('.name')
				.attr('href', costs[i].url)
				.attr('title', 'Checkout ' + costs[i].label + "'s site")
				.end()
			.find('.name h3')
				.text(costs[i].label)
				.end()
			.find('.variable .top')
				.text(costs[i].mvar.formatMoney(2, '.', ',') + '% + $' + mfixed.formatMoney(2, '.', ',') + ' =')
				.end()
			.find('.fixed .top')
				.text(costs[i].gvar.formatMoney(2, '.', ',') + '% + $' + gfixed.formatMoney(2, '.', ',') + ' =')
				.end()
			.find('.total .top')
				.text('w/sub. fee of $' + subfee.formatMoney(2, '.', ',') + ' =')
				.end()
			.find('.variable p span')
				.text(craftsite.formatMoney(2, '.', ','))
				.end()
			.find('.fixed p span')
				.text(processor.formatMoney(2, '.', ','))
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
