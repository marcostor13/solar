import qrcode
img = qrcode.make("https://reservas.casagarbo.pe/")
f = open("qr_garbo.png", "wb")
img.save(f)
f.close()