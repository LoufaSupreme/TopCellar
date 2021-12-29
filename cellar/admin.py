from django.contrib import admin
from .models import User, Profile, Entry, Address, Tag, Customer, Contact, Photo

# custom formatting for the admin page
class ProfileAdmin(admin.ModelAdmin):
    pass
    # filter_horizontal = ('following',)

class EntryAdmin(admin.ModelAdmin):
    filter_horizontal = ('contacts', 'tags', )

admin.site.register(User)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Entry, EntryAdmin)
admin.site.register(Address)
admin.site.register(Customer)
admin.site.register(Contact)
admin.site.register(Tag)
admin.site.register(Photo)


