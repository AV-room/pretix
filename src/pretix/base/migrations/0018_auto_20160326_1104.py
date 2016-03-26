# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-03-26 11:04
from __future__ import unicode_literals

import django.db.models.deletion
from django.db import migrations, models

import pretix.base.i18n


class Migration(migrations.Migration):

    dependencies = [
        ('pretixbase', '0017_auto_20160324_1615'),
    ]

    operations = [
        migrations.CreateModel(
            name='QuestionOption',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('answer', pretix.base.i18n.I18nCharField(verbose_name='Answer')),
            ],
        ),
        migrations.AlterField(
            model_name='item',
            name='free_price',
            field=models.BooleanField(default=False, help_text='If this option is active, your users can choose the price themselves. The price configured above is then interpreted as the minimum price a user has to enter. You could use this e.g. to collect additional donations for your event.', verbose_name='Free price input'),
        ),
        migrations.AlterField(
            model_name='question',
            name='type',
            field=models.CharField(choices=[('N', 'Number'), ('S', 'Text (one line)'), ('T', 'Multiline text'), ('B', 'Yes/No'), ('C', 'Choose one from a list'), ('M', 'Choose multiple from a list')], max_length=5, verbose_name='Question type'),
        ),
        migrations.AddField(
            model_name='questionoption',
            name='question',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pretixbase.Question'),
        ),
        migrations.AddField(
            model_name='questionanswer',
            name='option',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='pretixbase.QuestionOption'),
        ),
    ]