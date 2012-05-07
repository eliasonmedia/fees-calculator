$(function() {
	var box = $('#fee-box'),
		btn = $('#calc-btn');

	$('.toggle_button').toggleButton({callback: function() {
		$("#single").toggle();
		$("#annual").toggle();
	}});

	box
		.center()
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
						top: box.attr('data-orig-top')
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
			.attr('data-orig-top', box.css('top'))
			.attr('data-hide-top', $(window).height() - 80);

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
			calc(amount, freq);
		}, 1500);
	});

	$('input[type=text]')
		.keydown(function(e) {
			if(e.keyCode == 13) { btn.trigger('click'); }
		});
	$('.amount:visible')
		.filter(':visible').focus();

	// Was amount specifed in URL?
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
	$('#about-link').click(function() {
		$("#about").show();
		$("#calculator").hide();
	});
	$('#calculator-link').click(function() {
		$("#about").hide();
		$("#calculator").show();
	});
});

/**
* Turns matched element(s) into a custom gender selection box
* @returns {jQuery}
*/
jQuery.fn.center = function () {
	this
		.css({
			'position': 'fixed',
			'top': (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px",
			'left': (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px"
		});

	return this;
}

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
								'<span class="bottom">Var Rate</span>' +
							'</div>' +
							'<div class="plus"><p>+</p></div>' +
							'<div class="fixed">' +
								'<p>$<span></span></p>' +
								'<span class="bottom">Fixed Rate</span>' +
							'</div>' +
							'<div class="times"><p>&times;</p></div>' +
							'<div class="freq">' +
								'<p><span></span></p>' +
								'<span class="bottom">Frequency</span>' +
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

	// Track this
	if(clicky) {
		clicky.log(url, 'Calculate');
	}

	if(type == 'annual') {
		resultsBlock.append("<h2>How much you pay annually:</h2>");
	} else {
		resultsBlock.append("<h2>How much you pay per transaction:</h2>");
	}
	

	// Define gateway prices
	var costs = [
		{
			name: 'paypal',
			label: 'PayPal',
			variable: 2.9,
			fixed: 0.30,
			url: 'http://www.paypal.com'
		},
		{
			name: 'square',
			label: 'Square',
			variable: 2.75,
			fixed: 0,
			url: 'http://www.squareup.com'
		},
		{
			name: 'avg',
			label: 'Average Merchant',
			variable: 3.4,
			fixed: 0.30,
			url: '#'
		},
		{
			name: 'dwolla',
			label: 'Dwolla',
			url: 'http://www.dwolla.com',
			variable: 0,
			fixed: {
				trigger: 10,
				cost: 0.25,
				maxAmount: 5000
			}
		}
	];

	// Create elements for each payment gateway
	for (var i = costs.length - 1; i >= 0; i--) {
		var result = $('<div/>', {
				'class': 'result ' + costs[i].name,
				'html': resultBlock
			});

		// Calc costs
		var variable = ((costs[i].variable / 100) * amount),
			isFixedObject = (typeof costs[i].fixed == 'object'),
			fixed = ((isFixedObject && (amount >= costs[i].fixed.trigger)) || typeof costs[i].fixed == 'number') ? (isFixedObject ? costs[i].fixed.cost : costs[i].fixed) : 0;

		// Compensate for Dwolla's max transaction amount
		if (amount > costs[i].fixed.maxAmount) {
			fixed *= Math.ceil(amount / costs[i].fixed.maxAmount);
		}

		// Calculate final total
		var total = (+variable + +fixed);

		// Compensate for annual recurring transactions
		if(type == 'annual') {
			total = total * freq;
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
				.text(costs[i].variable.formatMoney(2, '.', ',') + '% * ' + amount + ' =')
				.end()
			.find('.variable p span')
				.text(variable.formatMoney(2, '.', ','))
				.end()
			.find('.fixed p span')
				.text(fixed.formatMoney(2, '.', ','))
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

	if(type == 'annual') {
		resultsBlock.addClass('annual');
	}
}
