$(function() {
	var box = $('#fee-box'),
		btn = $('#calc-btn');

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

	btn.click(function() {
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
		setTimeout(calc, 1500);
	});

	$('#amount')
		.focus()
		.keydown(function(e) {
			if(e.keyCode == 13) { btn.trigger('click'); }
		});
});

jQuery.fn.center = function () {
	this
		.css({
			'position': 'fixed',
			'top': (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px",
			'left': (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px"
		});

	return this;
}

Number.prototype.formatMoney = function(c, d, t){
	var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;

	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function compare_total(a, b) {
	if (a.total < b.total)
		return 1;
	if (a.total > b.total)
		return -1;

	return 0;
}

var calc = function() {
	var amount = +($('#amount').val().replace('$', '')),
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
								'<span class="bottom">Variable Rate</span>' +
							'</div>' +
							'<div class="plus"><p>+</p></div>' +
							'<div class="fixed">' +
								'<p>$<span></span></p>' +
								'<span class="bottom">Fixed Rate</span>' +
							'</div>' +
							'<div class="eq"><p>=</p></div>' +
							'<div class="total">' +
								'<p>$<span></span></p>' +
							'</div>' +
						'</div>';

	resultsBlock.append("<h2>Here's how much you'd be paying these gateways per transaction:</h2>");

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
				cost: 0.25
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
		var variable = ((costs[i].variable / 100) * amount).formatMoney(2, '.', ','),
			isFixedObject = (typeof costs[i].fixed == 'object'),
			fixed = ((isFixedObject && (amount >= costs[i].fixed.trigger)) || typeof costs[i].fixed == 'number') ? (isFixedObject ? costs[i].fixed.cost : costs[i].fixed).formatMoney(2, '.', ',') : 0,
			total = (+variable + +fixed).formatMoney(2, '.', ',');

		result
			.find('.name')
				.attr('href', costs[i].url)
				.attr('title', 'Checkout ' + costs[i].label + "'s site")
				.end()
			.find('.name h3')
				.text(costs[i].label)
				.end()
			.find('.variable .top')
				.text(costs[i].variable + '% * ' + amount + ' =')
				.end()
			.find('.variable p span')
				.text(variable)
				.end()
			.find('.fixed p span')
				.text(fixed)
				.end()
			.find('.total p span')
				.text(total);

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
}
