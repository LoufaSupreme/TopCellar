from django.contrib import admin
from .models import User, Profile, Entry, Address, Tag, Customer, Contact

# custom formatting for the admin page
class ProfileAdmin(admin.ModelAdmin):
    pass
    # filter_horizontal = ('following',)


admin.site.register(User)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Entry)
admin.site.register(Address)
admin.site.register(Customer)
admin.site.register(Contact)
admin.site.register(Tag)


