$(function() {
	$('#navbar').find('li a').click(grabLink);
	$('a.animate').click(grabLink);
});

var grabLink = function(e) {
	e.preventDefault();

	slide = $($(this).attr('href'));
	$.scrollTo(slide, {
		duration: 1000,
		easing: 'easeInOutQuart'
	});

	return false;
}