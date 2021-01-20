new: static_html.tgz
	echo "Make new static_html.tgz"

static_html.tgz: static_html
	echo "create static_html.tgz"
	tar czvf static_html.tgz static_html


static_html: minimal-doorlockd
	echo "rm static_html, and mv doorlockd static_html"
	rm -rfv static_html
	mv -v minimal-doorlockd static_html

minimal-doorlockd:
	echo "ng build --prod"
	ng build --prod
